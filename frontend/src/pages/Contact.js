import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Contact() {
  return (
    <Layout>
      <section className="w-full max-w-xl mx-auto text-center flex flex-col items-center gap-12">
        <Card className="w-full bg-white/95 shadow-lg border-blue-100">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-blue-700 mb-2 animate-fade-in">Contact AnonChat Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-800 text-lg">Have questions or feedback? Reach out and we'll get back to you soon.</p>
            <form className="flex flex-col gap-4 items-center">
              <input className="w-full border rounded px-3 py-2 text-lg" type="text" placeholder="Your Name" required />
              <input className="w-full border rounded px-3 py-2 text-lg" type="email" placeholder="Your Email" required />
              <textarea className="w-full border rounded px-3 py-2 text-lg" placeholder="Your Message" rows={4} required />
              <Button className="w-48 mt-2 text-lg py-3 bg-blue-700 hover:bg-blue-800 text-white" type="submit">Send Message</Button>
            </form>
            <div className="mt-6">
              <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
