
module.exports = (env, callback) ->

  defaults =
    template: "artwork.jade"
    artworks: "artworks"

  options = env.config.portflolio or {}
  for key, value of defaults
    options[key] ?= defaults[key]

  getPortfolioItems = (contents) ->
    console.log "Getting Items.."
    artworks = contents[options.artworks]._.directories.map (item) -> item.index
    console.log artworks.length + " items found!"
    return artworks

  class PortflolioItemPage extends env.plugins.MarkdownPage

    getTemplate: ->
      @metadata.template or options.template or super()

    getFilenameTemplate: ->
      @metadata.filenameTemplate or options.filenameTemplate or super()

  prefix = if options.artworks then options.artworks + '/' else ''
  env.registerContentPlugin 'artworks',  prefix + '**/*.md', PortflolioItemPage

  # class PortfolioPage extends env.plugins.Page

  #   constructor: (@artworks) ->

  #   getFilename: ->
  #     return 'portfolio.html'

  #   getView: -> (env, locals, contents, templates, callback) ->

  #     template = templates[options.template]
  #     if not template?
  #       return callback new Error "unknown portfolio template '#{ options.template }"

  #     env.utils.extend @artworks, locals
  #     template.render @artworks, callback



  # env.registerGenerator 'artworks', (contents, callback) ->

  #   artworks = getPortfolioItems contents

  #   pages = []
  #   for artwork, i in artworks
  #     pages.push new PortfolioItemPage artworks

  #   rv = {pages:{}}
  #   rv.pages = pages

  #   callback null, rv

  env.helpers.getPortfolioItems = getPortfolioItems

  callback()