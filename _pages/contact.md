---
layout: page
title: Contact
permalink: /contact/
description: Get in touch...
nav: true
nav_order: 5
---

<!--
  Edit the values below to update your name, position, and address.
  The map and the social icons update automatically — see the notes
  further down for how each of those works.
-->

<div class="contact text-center">
  <h2 class="contact-name mb-0">{{ site.first_name }} {{ site.middle_name }} {{ site.last_name }}</h2>
  <p class="contact-position text-muted mb-3">Postdoctoral Researcher / Dr.</p>

  <p class="contact-address mb-4">
    Center for Advanced Systems Understanding<br />
    Helmholtz-Zentrum Dresden-Rossendorf<br />
    Conrad-Schiedt-Str. 20, D-02826 Görlitz, Germany
  </p>

  <!--
    Google Maps embed — no API key needed.
    Replace the text after "q=" with your own address (URL-encoded, i.e.
    spaces become "+"), or with "lat,lng" coordinates if you'd rather pin
    an exact point instead of an address lookup.
  -->
  <div class="contact-map mb-4">
    <iframe
      src="https://www.google.com/maps?q=51.155251093251096,14.976955907105307&output=embed"
      width="100%"
      height="350"
      style="border:0; border-radius: 0.375rem;"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>

  <!--
    Reuses the same social icons / links already configured in
    _data/socials.yml (the same file that powers the icons on your
    About page) — nothing to duplicate here.
  -->
  <div class="social">
    <div class="contact-icons">{% social_links %}</div>
  </div>
</div>

<style>
  .contact {
    max-width: 500px;
    margin: 0 auto;
  }

  .contact-name {
    font-weight: 600;
  }

  .contact-icons {
    font-size: 2.5rem;
  }

  .contact-icons a {
    margin: 0 0.5rem;
  }

  .contact-icons img {
    width: 2rem;
    height: 2rem;
  }
</style>
