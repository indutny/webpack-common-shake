'use strict';

const acorn = require('acorn');
const WebpackModule = require('webpack/lib/Module');
const CommonJsRequireDependency =
    require('webpack/lib/dependencies/CommonJsRequireDependency');
const RawSource = require('webpack-sources').RawSource;

const shake = require('common-shake');
const Analyzer = shake.Analyzer;

class ReplacementModule extends WebpackModule {
  constructor(info, original, options) {
    super();

    this.shake = { info, original, options };

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
    const shake = this.shake;

    let original = shake.original.source(dependencyTemplates,
                                         outputOptions,
                                         requestShortener).source();

    const analyzer = new Analyzer();

    const declarations = analyzer.run(acorn.parse(original, {
      locations: true
    }), 'replacement').getDeclarations().filter((decl) => {
      return !shake.info.isUsed(decl.name);
    });

    if (shake.options.onExportDelete) {
      const resource = shake.original.resource;
      declarations.forEach((decl) => {
        shake.options.onExportDelete(resource, decl.name);
      });
    }

    const ranges = declarations.map((decl) => {
      return { name: decl.name, range: this._getDeclarationRange(decl.ast) };
    }).map(decl => decl.range).sort((a, b) => {
      return b.start - a.start;
    });

    let last = original.length;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];

      // TODO(indutny): print warning?
      if (range.end > last)
        return new RawSource(original);

      last = range.start;
    }

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];

      const before = original.slice(0, range.start);
      const after = original.slice(range.end);
      const replacement = range.replace(original);

      original = before + replacement + after;
    }

    return new RawSource(original);
  }

  size() { return this.shake.original.size(); }
  nameForCondition() { return this.shake.original.nameForCondition(); }

  _getDeclarationRange(node) {
    // `exports.a = 1`
    if (node.type === 'AssignmentExpression') {
      return {
        start: node.start,
        end: node.end,
        replace: (original) => {
          return original.slice(node.right.start, node.right.end)
        }
      };
    }

    return {
      start: node.start,
      end: node.end,
      replace: (original) => {
        const key = JSON.stringify(node.key.name || node.key.value);
        if (node.kind !== 'init')
          return `${key}: null`;

        const value = original.slice(node.value.start, node.value.end);
        return `${key}: (${value},null)`;
      }
    };
  }
}
module.exports = ReplacementModule;
