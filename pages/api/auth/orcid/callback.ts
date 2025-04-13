import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../../../config/firebase';
import { getAuth } from 'firebase/auth';

/**
 * API route to handle ORCID OAuth callback
 * 
 * This endpoint exchanges the authorization code for an access token
 * and retrieves the user's ORCID profile information
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is missing' });
    }

    // Get credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID;
    const clientSecret = process.env.ORCID_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_ORCID_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({ error: 'ORCID configuration is missing' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://orcid.org/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': clientId,
        'client_secret': clientSecret,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('ORCID token exchange error:', errorData);
      return res.status(tokenResponse.status).json({ error: 'Failed to exchange authorization code', details: errorData });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, orcid } = tokenData;

    if (!access_token || !orcid) {
      return res.status(500).json({ error: 'Invalid response from ORCID' });
    }

    // Fetch user profile data from ORCID
    const profileResponse = await fetch(`https://pub.orcid.org/v3.0/${orcid}/person`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error('ORCID profile fetch error:', errorData);
      return res.status(profileResponse.status).json({ error: 'Failed to fetch ORCID profile', details: errorData });
    }

    const profileData = await profileResponse.json();
    
    // Extract relevant information from the profile
    const name = profileData.name?.['given-names']?.value || '';
    const familyName = profileData.name?.['family-name']?.value || '';
    const fullName = `${name} ${familyName}`.trim();
    
    // Get affiliation information if available
    let affiliation = '';
    if (profileData.employments?.['employment-summary'] && profileData.employments['employment-summary'].length > 0) {
      const latestEmployment = profileData.employments['employment-summary'][0];
      affiliation = latestEmployment.organization?.name || '';
    }

    // Get the current user from Firebase Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update the user's profile in Firestore
    const db = getFirebaseFirestore();
    if (db) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Update existing user document
        await updateDoc(userDocRef, {
          orcid,
          orcidAccessToken: access_token,
          orcidConnected: true,
          name: fullName || userDoc.data().name || '',
          displayName: fullName || userDoc.data().displayName || '',
          affiliation: affiliation || userDoc.data().affiliation || userDoc.data().institution || '',
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new user document
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          name: fullName || '',
          displayName: fullName || '',
          orcid,
          orcidAccessToken: access_token,
          orcidConnected: true,
          affiliation: affiliation || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Redirect to profile page with success message
    res.redirect('/profile?orcid_connected=true');
  } catch (error) {
    console.error('Error in ORCID callback:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
