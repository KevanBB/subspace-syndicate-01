import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Acceptable Use Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2>1. Prohibited Content</h2>
              <p>
                The following types of content are strictly prohibited:
              </p>
              <ul>
                <li>Violence or graphic content</li>
                <li>Illegal activities or substances</li>
                <li>Misinformation or deceptive content</li>
                <li>Copyrighted material without permission</li>
                <li>Personal information of others</li>
                <li>Spam or commercial content without disclosure</li>
              </ul>
            </section>

            <section>
              <h2>2. Content Guidelines</h2>
              <p>
                All content must:
              </p>
              <ul>
                <li>Be original or properly attributed</li>
                <li>Respect community guidelines</li>
                <li>Be appropriately rated</li>
                <li>Not promote harmful behavior</li>
                <li>Not violate privacy rights</li>
                <li>Not contain malware or harmful links</li>
                <li>Not impersonate others</li>
                <li>Not engage in harassment</li>
              </ul>
            </section>

            <section>
              <h2>3. Monetization Guidelines</h2>
              <p>
                When monetizing content:
              </p>
              <ul>
                <li>Clearly disclose sponsored content</li>
                <li>Use appropriate pricing practices</li>
                <li>Provide value for paid content</li>
                <li>Maintain transparent subscription terms</li>
                <li>Not engage in deceptive marketing</li>
                <li>Not exploit vulnerable audiences</li>
                <li>Not promote harmful products</li>
                <li>Not engage in price gouging</li>
              </ul>
            </section>

            <section>
              <h2>4. Community Interaction</h2>
              <p>
                When interacting with the community:
              </p>
              <ul>
                <li>Be respectful and professional</li>
                <li>Respond to feedback appropriately</li>
                <li>Maintain appropriate boundaries</li>
                <li>Not engage in harassment</li>
                <li>Not spread misinformation</li>
                <li>Not exploit community trust</li>
              </ul>
            </section>

            <section>
              <h2>5. Enforcement</h2>
              <p>
                We may take the following actions for violations:
              </p>
              <ul>
                <li>Remove violating content</li>
                <li>Issue warnings</li>
                <li>Suspend creator privileges</li>
                <li>Terminate creator accounts</li>
                <li>Report illegal activities to authorities</li>
                <li>Withhold payments for violations</li>
                <li>Ban users from the platform</li>
                <li>Take legal action when necessary</li>
              </ul>
            </section>

            <section>
              <h2>6. Reporting</h2>
              <p>
                To report violations:
              </p>
              <ul>
                <li>Use the in-app reporting system</li>
                <li>Contact our moderation team</li>
                <li>Email support@subspace.com</li>
                <li>Include relevant evidence</li>
                <li>Provide context for the report</li>
                <li>Follow up if needed</li>
              </ul>
            </section>

            <section>
              <h2>7. Updates</h2>
              <p>
                This policy may be updated periodically. We will notify creators of
                significant changes. Continued use of the platform after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2>8. Contact</h2>
              <p>
                For questions about this policy, please contact us at{" "}
                <a href="mailto:support@subspace.com" className="text-primary hover:underline">
                  support@subspace.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 