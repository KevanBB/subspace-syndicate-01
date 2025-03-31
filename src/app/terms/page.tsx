import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Creator Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to SubSpace's Creator Program. By applying to become a creator,
                you agree to these terms and conditions. Please read them carefully.
              </p>
            </section>

            <section>
              <h2>2. Eligibility</h2>
              <p>
                To become a creator on SubSpace, you must:
              </p>
              <ul>
                <li>Be at least 18 years old</li>
                <li>Have a valid government-issued ID</li>
                <li>Provide accurate personal information</li>
                <li>Comply with our content guidelines</li>
              </ul>
            </section>

            <section>
              <h2>3. Content Guidelines</h2>
              <p>
                As a creator, you agree to:
              </p>
              <ul>
                <li>Create original content that complies with our Acceptable Use Policy</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain appropriate content ratings</li>
                <li>Not engage in harmful or deceptive practices</li>
              </ul>
            </section>

            <section>
              <h2>4. Revenue Sharing</h2>
              <p>
                Revenue sharing terms:
              </p>
              <ul>
                <li>Subscription revenue is shared according to our standard rates</li>
                <li>Payments are processed monthly</li>
                <li>Minimum payout thresholds apply</li>
                <li>Tax information must be provided when required</li>
              </ul>
            </section>

            <section>
              <h2>5. Account Management</h2>
              <p>
                You are responsible for:
              </p>
              <ul>
                <li>Maintaining the security of your account</li>
                <li>Keeping your profile information up to date</li>
                <li>Managing your subscription tiers and pricing</li>
                <li>Responding to subscriber inquiries</li>
              </ul>
            </section>

            <section>
              <h2>6. Termination</h2>
              <p>
                We reserve the right to:
              </p>
              <ul>
                <li>Suspend or terminate creator accounts for violations</li>
                <li>Modify these terms with notice</li>
                <li>Adjust revenue sharing rates with notice</li>
                <li>Remove content that violates our policies</li>
              </ul>
            </section>

            <section>
              <h2>7. Contact</h2>
              <p>
                For questions about these terms, please contact us at{" "}
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