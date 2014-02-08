
# https://github.com/jasonm/ngmin-rails/pull/9
require 'ngmin/processor'
::Sprockets.register_postprocessor 'application/javascript', Ngmin::Processor

###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

proxy "/online.html", "/template.html", :locals => { :offline => false }, :ignore => true
proxy "/index.html", "/template.html", :locals => { :offline => true }, :ignore => true

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
activate :livereload

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

helpers do
  def offline
    false
  end
  def ng_template(name)
    "<script type='text/ng-template' id='/templates/#{name}.html'>#{File.read(File.join root, "source", "templates", "#{name}.html")}</script>"
  end
end

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

# Add vendor folders...
ready do
  sprockets.append_path File.join root, 'vendor'
  sprockets.append_path File.join root, 'bower_components'
end



