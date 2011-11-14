(function() {
  var AuthorPane, InstructionSequence, NoSequence, PickAPointSequence, Sequence;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AuthorPane = require('./author-panes').AuthorPane;
  Sequence = exports.Sequence = {
    classFor: {},
    fromHash: function(hash) {
      var SequenceClass;
      SequenceClass = this.classFor[(hash != null ? hash.type : void 0) || 'NoSequence'];
      if (!(SequenceClass != null)) {
        throw new Error("Sequence type " + hash.type + " is not supported");
      }
      return new SequenceClass(hash);
    }
  };
  Sequence.classFor['NoSequence'] = NoSequence = (function() {
    function NoSequence() {}
    NoSequence.prototype.appendSteps = function(runtimePage) {
      var pane, step, _i, _len, _ref, _results;
      step = runtimePage.appendStep();
      _ref = this.page.panes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pane = _ref[_i];
        _results.push(pane.addToStep(step));
      }
      return _results;
    };
    return NoSequence;
  })();
  Sequence.classFor['InstructionSequence'] = InstructionSequence = (function() {
    function InstructionSequence(_arg) {
      this.text = _arg.text;
    }
    InstructionSequence.prototype.appendSteps = function(runtimePage) {
      var pane, step, _i, _len, _ref, _results;
      step = runtimePage.appendStep();
      step.setBeforeText(this.text);
      _ref = this.page.panes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pane = _ref[_i];
        _results.push(pane.addToStep(step));
      }
      return _results;
    };
    return InstructionSequence;
  })();
  Sequence.classFor['PickAPointSequence'] = PickAPointSequence = (function() {
    PickAPointSequence.prototype.HIGHLIGHT_COLOR = '#1f77b4';
    function PickAPointSequence(_arg) {
      this.initialPrompt = _arg.initialPrompt, this.correctAnswerPoint = _arg.correctAnswerPoint, this.hints = _arg.hints, this.giveUp = _arg.giveUp, this.confirmCorrect = _arg.confirmCorrect;
      if (typeof this.initialPrompt === 'string') {
        this.initialPrompt = {
          text: this.initialPrompt
        };
      }
    }
    PickAPointSequence.prototype.appendSteps = function(runtimePage) {
      var addPanesAndFeedbackToStep, answerableInfo, answerableSteps, confirmCorrectStep, datadefRef, giveUpStep, graphPane, highlightedPoint, i, index, lastAnswerableStep, pane, runtimeActivity, step, steps, tablePane, tag, _i, _len, _len2, _len3, _ref, _ref2, _results;
      _ref = this.page.panes || [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        pane = _ref[i];
        if (pane instanceof AuthorPane.classFor['PredefinedGraphPane']) {
          graphPane = pane;
        }
        if (pane instanceof AuthorPane.classFor['TablePane']) {
          tablePane = pane;
        }
      }
      if (!(graphPane != null) && !(tablePane != null)) {
        throw new Error("PickAPointSequence requires at least one graph or table pane");
      }
      runtimeActivity = runtimePage.activity;
      datadefRef = runtimeActivity.getDatadefRef("" + this.page.index + "-" + graphPane.index);
      tag = runtimeActivity.createAndAppendTag();
      highlightedPoint = runtimeActivity.createAndAppendHighlightedPoint({
        datadefRef: datadefRef,
        tag: tag,
        color: this.HIGHLIGHT_COLOR
      });
      steps = [];
      answerableSteps = [];
      addPanesAndFeedbackToStep = __bind(function(_arg) {
        var color, from, overlay, pane, prompt, step, xMax, xMin, _i, _j, _len2, _len3, _ref2, _ref3, _ref4, _results;
        step = _arg.step, from = _arg.from;
        _ref2 = this.page.panes;
        for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
          pane = _ref2[_i];
          pane.addToStep(step);
        }
        step.setBeforeText(from.text);
        _ref4 = (_ref3 = from.visualPrompts) != null ? _ref3 : [];
        _results = [];
        for (_j = 0, _len3 = _ref4.length; _j < _len3; _j++) {
          prompt = _ref4[_j];
          _results.push(prompt.type === 'RangeVisualPrompt' ? ((color = prompt.color, xMin = prompt.xMin, xMax = prompt.xMax, prompt), xMin != null ? xMin : xMin = -Infinity, xMax != null ? xMax : xMax = Infinity, overlay = runtimeActivity.createAndAppendSegmentOverlay({
            datadefRef: datadefRef,
            color: color,
            xMin: xMin,
            xMax: xMax
          }), step.addAnnotationToPane({
            annotation: overlay,
            index: graphPane.index
          })) : void 0);
        }
        return _results;
      }, this);
      _ref2 = [this.initialPrompt].concat(this.hints);
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        answerableInfo = _ref2[_i];
        steps.push(step = runtimePage.appendStep());
        answerableSteps.push(step);
        addPanesAndFeedbackToStep({
          step: step,
          from: answerableInfo
        });
      }
      steps.push(giveUpStep = runtimePage.appendStep());
      addPanesAndFeedbackToStep({
        step: giveUpStep,
        from: this.giveUp
      });
      steps.push(confirmCorrectStep = runtimePage.appendStep());
      addPanesAndFeedbackToStep({
        step: confirmCorrectStep,
        from: this.confirmCorrect
      });
      lastAnswerableStep = answerableSteps[answerableSteps.length - 1];
      _results = [];
      for (index = 0, _len3 = answerableSteps.length; index < _len3; index++) {
        step = answerableSteps[index];
        if (graphPane != null) {
          step.addAnnotationToPane({
            annotation: highlightedPoint,
            index: graphPane.index
          });
        }
        if (tablePane != null) {
          step.addAnnotationToPane({
            annotation: highlightedPoint,
            index: tablePane.index
          });
        }
        step.addTaggingTool({
          tag: tag,
          datadefRef: datadefRef
        });
        step.setSubmitButtonTitle("Check My Answer");
        step.appendResponseBranch({
          criterion: ["coordinates=", tag.name, this.correctAnswerPoint[0], this.correctAnswerPoint[1]],
          step: confirmCorrectStep
        });
        _results.push(step === lastAnswerableStep ? step.setDefaultBranch(giveUpStep) : step.setDefaultBranch(answerableSteps[index + 1]));
      }
      return _results;
    };
    return PickAPointSequence;
  })();
}).call(this);