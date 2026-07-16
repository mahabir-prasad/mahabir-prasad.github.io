---
layout: page
title: Gallery
permalink: /gallery/
description: A collection of moments, organized by date. Click any image to zoom in — click again (or scroll away) to zoom back out.
nav: true
nav_order: 4
---

<!--
  To add a photo: create a new file in _gallery/, e.g. _gallery/2025-09-01-my-photo.md.

  SINGLE PHOTO per file:
    ---
    title: A short title (optional)
    date: 2025-09-01
    image: assets/img/your-photo.jpg
    description: A sentence or two about this photo.
    ---

  MULTIPLE PHOTOS in one file (e.g. all the photos from one event/trip),
  use `images:` instead of `image:`/`description:` — as many as you like.
  Each photo can optionally have its OWN `date:`, which overrides the
  file's top-level date just for that photo — handy when one file covers
  photos from different days or even different years:
    ---
    title: Conference trip (used for any photo below that has no title of its own)
    date: 2025-09-01
    images:
      - path: assets/img/your-photo-1.jpg
        description: A sentence about this one.
      - path: assets/img/your-photo-2.jpg
        description: From a follow-up trip the next year.
        date: 2026-02-14
    ---

  Either way, this page automatically groups every photo under the right
  year and keeps everything sorted with the most recent photos first. You
  don't need to touch this file — the flattening/date-resolving happens in
  _plugins/gallery_photos.rb.
-->

<div class="gallery">
  {% assign sorted_photos = site.data.gallery_photos | sort: "date" | reverse %}
  {% assign photos_by_year = sorted_photos | group_by_exp: "photo", "photo.date | date: '%Y'" %}

  {% for year_group in photos_by_year %}
    <h3 class="gallery-year-title{% unless forloop.first %} mt-5{% endunless %}">{{ year_group.name }}</h3>

    <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4 mb-2">
      {% for photo in year_group.items %}
        <div class="col text-center d-flex flex-column align-items-center">
          <div class="gallery-thumb">
            {% include figure.liquid loading="eager" path=photo.path class="img-fluid rounded z-depth-1" zoomable=true %}
          </div>
          {% if photo.title %}
            <p class="gallery-caption-title mt-2 mb-0 small fw-bold">{{ photo.title }}</p>
          {% endif %}
          <p class="gallery-caption mt-1 mb-0 small text-muted">{{ photo.description }}</p>
          <p class="gallery-date mt-1 mb-0" style="font-size: 0.75rem;">{{ photo.date | date: "%B %-d, %Y" }}</p>
        </div>
      {% endfor %}
    </div>
  {% endfor %}
</div>

<style>
  .gallery-thumb {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 0.375rem;
  }

  .gallery-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: zoom-in;
  }