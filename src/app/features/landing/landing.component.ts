import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Experience Luxury Like Never Before</h1>
          <p>Discover world-class accommodations with exceptional service and unforgettable experiences.</p>
          <div class="hero-actions">
            <button mat-raised-button color="primary" size="large" routerLink="/search">
              Book Your Stay
            </button>
            <button mat-stroked-button color="primary" size="large" routerLink="/register">
              Join Us Today
            </button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2>Why Choose Our Hotel?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <mat-icon>hotel</mat-icon>
              <h3>Luxury Rooms</h3>
              <p>Experience comfort in our beautifully designed rooms with modern amenities and stunning views.</p>
            </div>
            <div class="feature-card">
              <mat-icon>restaurant</mat-icon>
              <h3>Fine Dining</h3>
              <p>Enjoy world-class cuisine at our award-winning restaurants with diverse culinary experiences.</p>
            </div>
            <div class="feature-card">
              <mat-icon>spa</mat-icon>
              <h3>Wellness & Spa</h3>
              <p>Rejuvenate your body and mind at our full-service spa with premium treatments and facilities.</p>
            </div>
            <div class="feature-card">
              <mat-icon>room_service</mat-icon>
              <h3>24/7 Service</h3>
              <p>Our dedicated staff is available around the clock to ensure your stay is perfect.</p>
            </div>
            <div class="feature-card">
              <mat-icon>wifi</mat-icon>
              <h3>Free WiFi</h3>
              <p>Stay connected with complimentary high-speed internet throughout the property.</p>
            </div>
            <div class="feature-card">
              <mat-icon>local_parking</mat-icon>
              <h3>Valet Parking</h3>
              <p>Convenient valet parking service for all guests with secure vehicle storage.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Room Types Section -->
      <section class="room-types-section">
        <div class="container">
          <h2>Our Room Collection</h2>
          <div class="room-types-grid">
            <div class="room-type-card">
              <div class="room-image" style="background-image: url('https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg')"></div>
              <div class="room-content">
                <h3>Single Room</h3>
                <p>Perfect for solo travelers, featuring a comfortable bed and essential amenities.</p>
                <div class="room-price">Starting from <strong>$150/night</strong></div>
                <button mat-raised-button color="primary">View Details</button>
              </div>
            </div>
            <div class="room-type-card">
              <div class="room-image" style="background-image: url('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg')"></div>
              <div class="room-content">
                <h3>Double Room</h3>
                <p>Spacious accommodations for couples or friends with premium comfort features.</p>
                <div class="room-price">Starting from <strong>$250/night</strong></div>
                <button mat-raised-button color="primary">View Details</button>
              </div>
            </div>
            <div class="room-type-card">
              <div class="room-image" style="background-image: url('https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg')"></div>
              <div class="room-content">
                <h3>Luxury Suite</h3>
                <p>Ultimate luxury experience with separate living area and premium amenities.</p>
                <div class="room-price">Starting from <strong>$450/night</strong></div>
                <button mat-raised-button color="primary">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <div class="container">
          <h2>What Our Guests Say</h2>
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"Absolutely amazing experience! The staff was incredibly welcoming and the room was perfect. Will definitely stay again."</p>
              </div>
              <div class="testimonial-author">
                <strong>Sarah Johnson</strong>
                <span>★★★★★</span>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"The location is perfect and the amenities are top-notch. The spa service was exceptional and truly relaxing."</p>
              </div>
              <div class="testimonial-author">
                <strong>Michael Chen</strong>
                <span>★★★★★</span>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"Outstanding service from check-in to check-out. The dining experience exceeded all expectations."</p>
              </div>
              <div class="testimonial-author">
                <strong>Emma Davis</strong>
                <span>★★★★★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Ready to Experience Luxury?</h2>
          <p>Book your stay today and create unforgettable memories with us.</p>
          <div class="cta-actions">
            <button mat-raised-button color="primary" size="large" routerLink="/search">
              <mat-icon>search</mat-icon>
              Search Available Rooms
            </button>
            <button mat-stroked-button color="primary" size="large" routerLink="/register">
              <mat-icon>person_add</mat-icon>
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
    }

    .hero-section {
      background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg');
      background-size: cover;
      background-position: center;
      color: white;
      padding: 120px 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .hero-content h1 {
      font-size: 48px;
      font-weight: 300;
      margin: 0 0 16px 0;
      max-width: 800px;
    }

    .hero-content p {
      font-size: 20px;
      margin: 0 0 32px 0;
      opacity: 0.9;
      max-width: 600px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .features-section, .room-types-section, .testimonials-section, .cta-section {
      padding: 80px 0;
    }

    .features-section {
      background: #f8f9fa;
    }

    .features-section h2, .room-types-section h2, .testimonials-section h2, .cta-section h2 {
      text-align: center;
      font-size: 36px;
      font-weight: 300;
      margin: 0 0 48px 0;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-8px);
    }

    .feature-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 24px;
      font-weight: 400;
      margin: 0 0 12px 0;
      color: #333;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .room-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 32px;
    }

    .room-type-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .room-type-card:hover {
      transform: translateY(-8px);
    }

    .room-image {
      height: 250px;
      background-size: cover;
      background-position: center;
    }

    .room-content {
      padding: 24px;
    }

    .room-content h3 {
      font-size: 24px;
      font-weight: 400;
      margin: 0 0 12px 0;
      color: #333;
    }

    .room-content p {
      color: #666;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .room-price {
      font-size: 18px;
      color: #1976d2;
      margin: 0 0 16px 0;
    }

    .testimonials-section {
      background: #f8f9fa;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .testimonial-card {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .testimonial-content p {
      font-style: italic;
      color: #333;
      line-height: 1.6;
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .testimonial-author {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .testimonial-author strong {
      color: #333;
    }

    .testimonial-author span {
      color: #ffa726;
    }

    .cta-section {
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      color: white;
      text-align: center;
    }

    .cta-section h2 {
      color: white;
    }

    .cta-section p {
      font-size: 18px;
      margin: 0 0 32px 0;
      opacity: 0.9;
    }

    .cta-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 32px;
      }

      .hero-content p {
        font-size: 16px;
      }

      .hero-actions, .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .features-grid, .room-types-grid, .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {}