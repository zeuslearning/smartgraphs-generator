###
  "Activity" object in author forat.

  This class is built from an input hash (in the 'semantic JSON' format) and instantiates and manages child objects
  which represent the different model objects of the semantic JSON format.

  The various subtypes of pages will know how to call 'builder' methods on the runtime.* classes to insert elements as
  needed.

  For example, an author.sensorPage would have to know to call methods like RuntimeActivity.addGraph and
  RuntimeActivity.addDataset, as well as mehods such as, perhaps, RuntimeActivity.appendPage, RuntimePage.appendStep,
  and Step.addTool('sensor')

  The complexity of processing the input tree and deciding which builder methods on the runtime Page, runtime Step, etc
  to call mostly belong here. We expect there will be a largish and growing number of classes and subclasses in the
  author/ group, and that the runtime/ classes mostly just need to help keep the 'accounting' straight when the author/
  classes call builder methods on them.
###

{AuthorPage}      = require './author-page'
{RuntimeActivity} = require '../runtime/runtime-activity'

exports.AuthorActivity = class AuthorActivity

  constructor: (@hash) ->
    if @hash.type isnt 'Activity'
      throw new Error "smartgraphs-generator: AuthorActivity constructor was called with a hash whose toplevel element does not have type: \"Activity\""

    {@name,  @owner} = hash
    @owner ||= 'shared'        # until we get owner's username into the input hash
    @pages = (new AuthorPage(page, this, i + 1) for page, i in hash.pages)

  toRuntimeActivity: ->
    runtimeActivity = new RuntimeActivity @owner, @name
    # Remember, input models call builder methods on output models. At least for now.
    runtimeActivity.appendPage page.toRuntimePage(runtimeActivity) for page in @pages
    runtimeActivity
