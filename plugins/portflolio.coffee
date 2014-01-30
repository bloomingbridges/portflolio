module.exports = (env, callback) ->

  defaults =
    template: 'portfolio.jade'
    items: 'portfolio'

  options = env.config.portflolio or {}
  for key, value of defaults
    options[key] ?= defaults[key]

  getPortfolioItems = (contents) ->
    items = contents[options.items]._.directories.map (item) -> item.index
    return items

  env.helpers.getPortfolioItems = getPortfolioItems

  callback()