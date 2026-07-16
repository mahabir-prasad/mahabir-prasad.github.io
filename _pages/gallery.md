---
layout: page
title: Gallery
permalink: /gallery/
description: A collection of moments, organized by date. Click any image to zoom in - click again (or scroll away) to zoom back out.
nav: true
nav_order: 4
---

<!--
  To add a photo: create a new file in _gallery/, e.g. _gallery/2025-09-01-my-photo.md,
  with front matter like:

    ---
    title: A short title (optional)
    date: 2025-09-01
    image: assets/img/your-photo.jpg
    description: A sentence or two about this photo.
    ---

  That's it — this page automatically groups it under the right year and
  keeps everything sorted with the most recent photos first. You don't
  need to touch this file.
-->

<div class="gallery">
  {% assign sorted_items = site.gallery | sort: "date" | reverse %}
  {% assign items_by_year = sorted_items | group_by_exp: "item", "item.date | date: '%Y'" %}

  {% for year_group in items_by_year %}
    <h3 class="gallery-year-title{% unless forloop.first %} mt-5{% endunless %}">{{ year_group.name }}</h3>

    <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4 mb-2">
      {% for item in year_group.items %}
        <div class="col text-center d-flex flex-column align-items-center">
          <div class="gallery-thumb">
            {% include figure.liquid loading="eager" path=item.image class="img-fluid rounded z-depth-1" zoomable=true %}
          </div>
          {% if item.title %}
            <p class="gallery-caption-title mt-2 mb-0 small fw-bold">{{ item.title }}</p>
          {% endif %}
          <p class="gallery-caption mt-1 mb-0 small text-muted">{{ item.description }}</p>
          <p class="gallery-date mt-1 mb-0" style="font-size: 0.75rem;">{{ item.date | date: "%B %-d, %Y" }}</p>
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

  .gallery-caption,
  .gallery-caption-title {
    max-width: 14rem;
  }
</style>
