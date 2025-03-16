import React from 'react';

export function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: March 15, 2025</p>
      
      <div className="prose lg:prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            This Cookie Policy explains how Researka ("we", "us", and "our") uses cookies and similar technologies 
            to recognize you when you visit our website at researka.com ("Website"). It explains what these technologies are 
            and why we use them, as well as your rights to control our use of them.
          </p>
          <p>
            In some cases we may use cookies to collect personal information, or that becomes personal information if we 
            combine it with other information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
            Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
            as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, Researka) are called "first party cookies". 
            Cookies set by parties other than the website owner are called "third party cookies". 
            Third party cookies enable third party features or functionality to be provided on or through the website 
            (e.g. like advertising, interactive content and analytics). The parties that set these third party cookies 
            can recognize your computer both when it visits the website in question and also when it visits certain other websites.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Why do we use cookies?</h2>
          <p>
            We use first and third party cookies for several reasons. Some cookies are required for technical reasons in order 
            for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies 
            also enable us to track and target the interests of our users to enhance the experience on our Online Properties. 
            Third parties serve cookies through our Website for advertising, analytics and other purposes. This is described in more detail below.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. The specific types of cookies served through our Website</h2>
          <p>The specific types of first and third party cookies served through our Website and the purposes they perform are described below:</p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Essential website cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, 
            such as access to secure areas.
          </p>
          <table className="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Purpose</th>
                <th className="py-2 px-4 border-b">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">researka-session</td>
                <td className="py-2 px-4 border-b">Used to maintain user sessions and authentication state</td>
                <td className="py-2 px-4 border-b">Session</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">researka-csrf</td>
                <td className="py-2 px-4 border-b">Used to prevent cross-site request forgery attacks</td>
                <td className="py-2 px-4 border-b">Session</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Performance and functionality cookies</h3>
          <p>
            These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. 
            However, without these cookies, certain functionality may become unavailable.
          </p>
          <table className="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Purpose</th>
                <th className="py-2 px-4 border-b">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">researka-preferences</td>
                <td className="py-2 px-4 border-b">Stores user preferences such as theme, language, and accessibility settings</td>
                <td className="py-2 px-4 border-b">1 year</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">researka-recent-activity</td>
                <td className="py-2 px-4 border-b">Tracks recently viewed articles and activities for better user experience</td>
                <td className="py-2 px-4 border-b">30 days</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Analytics and customization cookies</h3>
          <p>
            These cookies collect information that is used either in aggregate form to help us understand how our Website is being used 
            or how effective our marketing campaigns are, or to help us customize our Website for you.
          </p>
          <table className="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Purpose</th>
                <th className="py-2 px-4 border-b">Duration</th>
                <th className="py-2 px-4 border-b">Provider</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">_ga</td>
                <td className="py-2 px-4 border-b">Used to distinguish users for analytics purposes</td>
                <td className="py-2 px-4 border-b">2 years</td>
                <td className="py-2 px-4 border-b">Google Analytics</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">_gid</td>
                <td className="py-2 px-4 border-b">Used to distinguish users for analytics purposes</td>
                <td className="py-2 px-4 border-b">24 hours</td>
                <td className="py-2 px-4 border-b">Google Analytics</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">_gat</td>
                <td className="py-2 px-4 border-b">Used to throttle request rate</td>
                <td className="py-2 px-4 border-b">1 minute</td>
                <td className="py-2 px-4 border-b">Google Analytics</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your 
            preferences in the Cookie Consent Banner that we display when you first visit our website.
          </p>
          <p>
            You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may 
            still use our website though your access to some functionality and areas of our website may be restricted. As the means by 
            which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's 
            help menu for more information.
          </p>
          <p>
            In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more 
            information, please visit <a href="http://www.aboutads.info/choices/" className="text-blue-600 hover:underline">http://www.aboutads.info/choices/</a> or 
            <a href="http://www.youronlinechoices.com" className="text-blue-600 hover:underline">http://www.youronlinechoices.com</a>.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. How often will we update this Cookie Policy?</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for 
            other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed 
            about our use of cookies and related technologies.
          </p>
          <p>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Where can I get further information?</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please email us at privacy@researka.com or by post to:
          </p>
          <p>
            Researka<br />
            [Your Company Address]<br />
            [City, State, ZIP]
          </p>
        </section>
      </div>
    </div>
  );
}

export default CookiePolicy;
