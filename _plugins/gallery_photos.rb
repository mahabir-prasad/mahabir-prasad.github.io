# _plugins/gallery_photos.rb
#
# Flattens the _gallery collection into a single list of individual photos,
# available in Liquid as `site.data.gallery_photos`.
#
# Why this exists: a single _gallery/*.md file can hold several photos via
# an `images:` list (e.g. all the photos from one trip or event). Each of
# those photos can optionally have its own `date:`, which overrides the
# file's top-level `date:` for that one photo. This plugin resolves that
# fallback (photo date -> file date) once, in Ruby, so the gallery page
# can just sort/group a plain flat array in Liquid without needing any
# special-case logic for single-photo vs multi-photo files.
#
# Nothing here needs to be edited when you add new photos — just add or
# edit files in _gallery/ as usual.

Jekyll::Hooks.register :site, :pre_render do |site|
  photos = []

  gallery = site.collections["gallery"]
  next unless gallery

  gallery.docs.each do |doc|
    images = doc.data["images"]

    if images.is_a?(Array) && !images.empty?
      images.each do |img|
        photos << {
          "path" => img["path"],
          "description" => img["description"],
          "title" => img["title"] || doc.data["title"],
          "date" => img["date"] || doc.data["date"],
        }
      end
    elsif doc.data["image"]
      photos << {
        "path" => doc.data["image"],
        "description" => doc.data["description"],
        "title" => doc.data["title"],
        "date" => doc.data["date"],
      }
    end
  end

  site.data["gallery_photos"] = photos
end
