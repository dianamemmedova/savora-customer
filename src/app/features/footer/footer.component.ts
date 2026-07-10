import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';


export interface FooterLink {
  label: string;
  path: string;
}

export interface FooterSocialLink {
  icon: string;
  url: string;
  label: string;
}

export interface FooterData {
  brandName: string;
  tagline: string;
  quickLinks: FooterLink[];
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: FooterSocialLink[];
  copyrightText: string;
}
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerData = signal<FooterData>({
    brandName: 'Savora',
    tagline: 'An iconic Italian kitchen for the whole family, continuing the tradition of authentic gastronomy with a modern twist.',
    quickLinks: [
      { label: 'Home', path: '/home' },
      { label: 'Menu', path: '/' },
      { label: 'Our Chef', path: '/chef' },
      { label: 'Contacts', path: '/' }
    ],
    phone: '7 (912) 32 43 546',
    email: 'info@savora.ru',
    address: 'st. Vosstaniya, 19, Saint Petersburg',
    workingHours: '10:00 - 23:00, every day',
    socialLinks: [
      { icon: 'fa-brands fa-instagram', url: '#', label: 'Instagram' },
      { icon: 'fa-brands fa-facebook', url: '#', label: 'Facebook' },
      { icon: 'fa-brands fa-tiktok', url: '#', label: 'TikTok' }
    ],
    copyrightText: 'Diana Memmedova.'
  });
}