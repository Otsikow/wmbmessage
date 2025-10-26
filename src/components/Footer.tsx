import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t mt-8 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Global Talent Gateway</h3>
          <p className="text-sm text-muted-foreground">
            Connecting African students to universities worldwide.
          </p>
        </div>
        <nav className="flex flex-col md:flex-row items-center gap-4 text-sm">
          <a href="https://globaltalentgateway.co.uk" className="hover:underline">
            Home
          </a>
          <a
            href="https://globaltalentgateway.co.uk/services"
            className="hover:underline"
          >
            Services
          </a>
          <a
            href="https://globaltalentgateway.co.uk/about-us"
            className="hover:underline"
          >
            About
          </a>
          <a
            href="https://globaltalentgateway.co.uk/contact"
            className="hover:underline"
          >
            Contact
          </a>
        </nav>
        <div className="flex gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
