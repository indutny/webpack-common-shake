'use strict';

const acorn = require('acorn');
const WebpackModule = require('webpack/lib/Module');
const CommonJsRequireDependency =
    require('webpack/lib/dependencies/CommonJsRequireDependency');
const RawSource = require('webpack-sources').RawSource;

const shake = require('common-shake');
const Analyzer = shake.Analyzer;

class ReplacementModule extends WebpackModule {
  constructor(info, original) {
    super();

    this.shake = { info, original };

    this.usedExports = original.usedExports;
    this.providedExports = original.providedExports;
    this.optimizationBailout = original.optimizationBailout;
    this.used = original.used;
    this._chunks = new Set(original._chunks);
    this.index = original.index;
    this.index2 = original.index2;
    this.depth = original.depth;
    this.built = original.built;
    this.cacheable = original.cacheable;
    this.dependencies = original.dependencies;
    this.reasons = original.reasons;
    this.meta = original.meta;
    this.moduleArgument = original.moduleArgument;
    this.exportsArgument = original.exportsArgument;
    this.strict = true;

    this.dependencies.forEach((dep) => {
      if (!dep.module)
        return;

      dep.module.reasons.forEach(reason => {
        if (reason.dependency === dep)
          reason.module = this;
      });
    });

    this.reasons.forEach((reason) => {
      reason.dependency.module = this;
    });

    this.dependenciesWarnings = original.dependenciesWarnings;
    this.dependenciesErrors = original.dependenciesErrors;
    this.warnings = original.warnings;
    this.errors = original.errors;
  }

  identifier() {
    return this.shake.original.identifier();
  }

  readableIdentifier(requestShortener) {
    return this.shake.original.readableIdentifier(requestShortener);
  }

  build(options, compilation, resolver, fs, callback) {
    return this.shake.original.build(options, compilation, resolver, fs,
                                     callback);
  }

  source(dependencyTemplates, outputOptions, requestShortener) {
    let original = this.shake.original.source(dependencyTemplates,
                                              outputOptions,
                                              requestShortener).source();

    const analyzer = new Analyzer();

    const declarations = analyzer.run(acorn.parse(original, {
      locations: true
    }), 'replacement').getDeclarations().filter((decl) => {
      return !this.shake.info.isUsed(decl.name);
    });

    const nodes = declarations.sort((a, b) => {
      return b.ast.start - a.ast.start;
    }).map(decl => decl.ast);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      const before = original.slice(0, node.start);
      const after = original.slice(node.end);
      const replacement = original.slice(node.right.start, node.right.end);

      original = before + replacement + after;
    }

    return new RawSource(original);
  }

  size() { return this.shake.original.size(); }
  nameForCondition() { return this.shake.original.nameForCondition(); }
}
module.exports = ReplacementModule;