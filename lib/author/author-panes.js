(function() {
  var AuthorPane, GraphPane, ImagePane, PredefinedGraphPane, PredictionGraphPane, SensorGraphPane, TablePane, dumbSingularize,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  dumbSingularize = require('../singularize').dumbSingularize;

  AuthorPane = exports.AuthorPane = {
    classFor: {},
    fromHash: function(hash) {
      var PaneClass;
      PaneClass = this.classFor[hash.type];
      if (!(PaneClass != null)) {
        throw new Error("Pane type " + hash.type + " is not supported");
      }
      return new PaneClass(hash);
    }
  };

  GraphPane = (function() {

    function GraphPane(_arg) {
      var includeAnnotationsFrom;
      this.title = _arg.title, this.xLabel = _arg.xLabel, this.xMin = _arg.xMin, this.xMax = _arg.xMax, this.xTicks = _arg.xTicks, this.yLabel = _arg.yLabel, this.yMin = _arg.yMin, this.yMax = _arg.yMax, this.yTicks = _arg.yTicks, includeAnnotationsFrom = _arg.includeAnnotationsFrom, this.showCrossHairs = _arg.showCrossHairs, this.showGraphGrid = _arg.showGraphGrid, this.showToolTipCoords = _arg.showToolTipCoords, this.includedDataSets = _arg.includedDataSets, this.labelSets = _arg.labelSets;
      this.activeDataSetIndex = 0;
      this.totalDatasetsIndex = 0;
      this.activeDatasetName;
      this.datadefRef = [];
      if (!this.includedDataSets) this.includedDataSets = [];
      if (!this.labelSets) this.labelSets = [];
      this.annotationSources = includeAnnotationsFrom != null ? includeAnnotationsFrom.map(function(source) {
        var page, pane, _ref;
        _ref = (source.match(/^page\/(\d)+\/pane\/(\d)+$/)).slice(1, 3).map(function(s) {
          return parseInt(s, 10) - 1;
        }), page = _ref[0], pane = _ref[1];
        return {
          page: page,
          pane: pane
        };
      }) : void 0;
    }

    GraphPane.prototype.addToPageAndActivity = function(runtimePage, runtimeActivity) {
      var dataKey, dataRef, populatedDataDef, populatedDataDefs, populatedDataSets, _i, _j, _len, _len2, _ref;
      this.runtimeActivity = runtimeActivity;
      if (this.includedDataSets != null) {
        if (this.includedDataSets.length !== 0) {
          populatedDataSets = runtimeActivity.populateDataSet(this.xLabel, this.yLabel, this.includedDataSets);
          populatedDataDefs = populatedDataSets.datadef;
          this.dataRef = populatedDataSets.dataref;
          if (!this.activeDatasetName) {
            this.activeDatasetName = populatedDataDefs[this.activeDataSetIndex].name;
          }
          _ref = this.dataRef;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            dataRef = _ref[_i];
            if (this.activeDatasetName === dataRef.name) {
              this.activeDatasetName = dataRef.datadefname;
              break;
            }
          }
          for (_j = 0, _len2 = populatedDataDefs.length; _j < _len2; _j++) {
            populatedDataDef = populatedDataDefs[_j];
            dataKey = "" + populatedDataDef.name;
            runtimeActivity.defineDatadef(dataKey, populatedDataDef);
            if (this.activeDatasetName === populatedDataDef.name) {
              this.xUnitsRef = populatedDataDef.xUnitsRef;
              this.yUnitsRef = populatedDataDef.yUnitsRef;
            }
            this.datadefRef.push(runtimeActivity.getDatadefRef(dataKey));
          }
        }
      }
      this.xAxis = runtimeActivity.createAndAppendAxis({
        label: this.xLabel,
        unitRef: this.xUnitsRef,
        min: this.xMin,
        max: this.xMax,
        nSteps: this.xTicks
      });
      return this.yAxis = runtimeActivity.createAndAppendAxis({
        label: this.yLabel,
        unitRef: this.yUnitsRef,
        min: this.yMin,
        max: this.yMax,
        nSteps: this.yTicks
      });
    };

    GraphPane.prototype.addToStep = function(step) {
      var createdAnnotation, labelSetName, _i, _j, _len, _len2, _ref, _ref2, _ref3,
        _this = this;
      step.addGraphPane({
        title: this.title,
        datadefRef: this.datadefRef,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        index: this.index,
        showCrossHairs: this.showCrossHairs,
        showGraphGrid: this.showGraphGrid,
        showToolTipCoords: this.showToolTipCoords,
        includedDataSets: this.includedDataSets,
        activeDatasetName: this.activeDatasetName,
        dataRef: this.dataRef,
        labelSets: this.labelSets
      });
      if (this.labelSets) {
        _ref = this.labelSets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          labelSetName = _ref[_i];
          if (this.runtimeActivity.annotations['LabelSet']) {
            _ref2 = this.runtimeActivity.annotations['LabelSet'];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              createdAnnotation = _ref2[_j];
              if (createdAnnotation.name === labelSetName) {
                step.addAnnotationToPane({
                  annotation: createdAnnotation,
                  index: this.index
                });
              }
            }
          }
        }
      }
      return (_ref3 = this.annotationSources) != null ? _ref3.forEach(function(source) {
        var page, pages, pane;
        pages = _this.page.activity.pages;
        page = pages[source.page];
        pane = page != null ? page.panes[source.pane] : void 0;
        if (!(page != null)) {
          throw new Error("When attempting to include annotations from pane " + (pane + 1) + " of page " + (page + 1) + ", couldn't find the page.");
        }
        if (!(pane != null)) {
          throw new Error("When attempting to include annotations from pane " + (pane + 1) + " of page " + (page + 1) + ", couldn't find the pane.");
        }
        if (!(pane.annotation != null)) {
          throw new Error("When attempting to include annotations from pane " + (pane + 1) + " of page " + (page + 1) + ", couldn't find the annotation.");
        }
        return step.addAnnotationToPane({
          index: source.pane,
          annotation: pane.annotation
        });
      }) : void 0;
    };

    return GraphPane;

  })();

  AuthorPane.classFor['PredefinedGraphPane'] = PredefinedGraphPane = (function(_super) {

    __extends(PredefinedGraphPane, _super);

    function PredefinedGraphPane() {
      PredefinedGraphPane.__super__.constructor.apply(this, arguments);
    }

    return PredefinedGraphPane;

  })(GraphPane);

  AuthorPane.classFor['SensorGraphPane'] = SensorGraphPane = (function(_super) {

    __extends(SensorGraphPane, _super);

    function SensorGraphPane() {
      SensorGraphPane.__super__.constructor.apply(this, arguments);
    }

    SensorGraphPane.prototype.addToStep = function(step) {
      var dataDefRef, dataKey, datadefRef, _i, _len, _ref;
      SensorGraphPane.__super__.addToStep.apply(this, arguments);
      dataKey = "" + this.activeDatasetName;
      datadefRef;
      _ref = this.datadefRef;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dataDefRef = _ref[_i];
        if (dataDefRef.key === dataKey) datadefRef = dataDefRef;
      }
      return step.addSensorTool({
        index: this.index,
        datadefRef: datadefRef
      });
    };

    return SensorGraphPane;

  })(GraphPane);

  AuthorPane.classFor['PredictionGraphPane'] = PredictionGraphPane = (function(_super) {

    __extends(PredictionGraphPane, _super);

    function PredictionGraphPane(_arg) {
      this.predictionType = _arg.predictionType;
      PredictionGraphPane.__super__.constructor.apply(this, arguments);
    }

    PredictionGraphPane.prototype.addToPageAndActivity = function(runtimePage, runtimeActivity) {
      PredictionGraphPane.__super__.addToPageAndActivity.apply(this, arguments);
      return this.annotation = runtimeActivity.createAndAppendAnnotation({
        type: 'FreehandSketch'
      });
    };

    PredictionGraphPane.prototype.addToStep = function(step, _arg) {
      var isActiveInputPane, previousAnnotation, uiBehavior;
      isActiveInputPane = _arg.isActiveInputPane, previousAnnotation = _arg.previousAnnotation;
      PredictionGraphPane.__super__.addToStep.apply(this, arguments);
      if (isActiveInputPane) {
        uiBehavior = this.predictionType === "continuous_curves" ? "freehand" : "extend";
        step.addPredictionTool({
          index: this.index,
          datadefRef: this.datadefRef,
          annotation: this.annotation,
          uiBehavior: uiBehavior
        });
        step.addAnnotationToPane({
          index: this.index,
          annotation: this.annotation
        });
      }
      if (previousAnnotation) {
        return step.addAnnotationToPane({
          index: this.index,
          annotation: previousAnnotation
        });
      }
    };

    return PredictionGraphPane;

  })(GraphPane);

  AuthorPane.classFor['ImagePane'] = ImagePane = (function() {

    function ImagePane(_arg) {
      this.url = _arg.url, this.license = _arg.license, this.attribution = _arg.attribution;
    }

    ImagePane.prototype.addToPageAndActivity = function(runtimePage, runtimeActivity) {};

    ImagePane.prototype.addToStep = function(step) {
      return step.addImagePane({
        url: this.url,
        license: this.license,
        attribution: this.attribution,
        index: this.index
      });
    };

    return ImagePane;

  })();

  AuthorPane.classFor['TablePane'] = TablePane = (function() {

    function TablePane(_arg) {
      this.xLabel = _arg.xLabel, this.yLabel = _arg.yLabel;
    }

    TablePane.prototype.addToPageAndActivity = function(runtimePage, runtimeActivity) {
      this.runtimeActivity = runtimeActivity;
    };

    TablePane.prototype.addToStep = function(step) {
      var dataKey, datadefRef, otherPaneIndex;
      otherPaneIndex = 1 - this.index;
      dataKey = "" + this.page.panes[otherPaneIndex].activeDatasetName;
      datadefRef = this.runtimeActivity.getDatadefRef(dataKey);
      return step.addTablePane({
        datadefRef: datadefRef,
        index: this.index,
        xLabel: this.xLabel,
        yLabel: this.yLabel
      });
    };

    return TablePane;

  })();

}).call(this);
