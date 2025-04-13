import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route to initiate ORCID OAuth flow
 * 
 * This endpoint redirects the user to the ORCID authorization page
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the client ID and redirect URI from environment variables
  const clientId = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_ORCID_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'ORCID configuration is missing' });
  }

  // Construct the ORCID authorization URL
  const authUrl = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Redirect the user to the ORCID authorization page
  res.redirect(authUrl);
}
