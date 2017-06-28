'use strict';

const shake = require('common-shake');
const Analyzer = shake.Analyzer;

const root = require('../shake');
const ReplacementModule = root.ReplacementModule;

function ShakeParserPlugin(analyzer, resources) {
  this.analyzer = analyzer;
  this.resources = resources;
}

ShakeParserPlugin.prototype.apply = function apply(parser) {
  parser.plugin('program', (ast) => {
    const resource = parser.state.current.resource;
    this.analyzer.run(ast, resource);
    this.resources.add(resource);
  });
};

function ShakePlugin() {
  this.analyzer = new Analyzer();
  this.resources = new Set();
}
module.exports = ShakePlugin;

ShakePlugin.prototype.apply = function apply(compiler) {
  compiler.plugin('compilation', (compilation, params) => {
    const imports = new Map();

    params.normalModuleFactory.plugin('parser', (parser, parserOptions) => {
      if (typeof parserOptions.commonjs !== 'undefined' &&
        !parserOptions.commonjs) {
        return;
      }

      parser.apply(new ShakeParserPlugin(this.analyzer, this.resources));
    });

    params.normalModuleFactory.plugin('create-module', (module) => {
      const issuer = module.resourceResolveData.context.issuer;
      if (issuer === null)
        return;
      this.analyzer.resolve(issuer, module.rawRequest, module.resource);
    });

    compilation.plugin('optimize-chunk-modules', (chunks, modules) => {
      const map = new Map();

      const mapModule = (module) => {
        if (map.has(module))
          return map.get(module);

        const res = this.mapModule(module);
        map.set(module, res);
        return res;
      };

      compilation.modules = modules.map(mapModule);
      chunks.forEach((chunk) => {
        const entryModule = mapModule(chunk.entryModule);
        chunk.setModules(chunk.mapModules(mapModule));
        chunk.entryModule = entryModule;
      });
    });
  });
};

ShakePlugin.prototype.mapModule = function mapModule(module) {
  if (!this.resources.has(module.resource))
    return module;

  const info = this.analyzer.getModule(module.resource);
  if (info.bailouts)
    return module;

  return new ReplacementModule(info, module);
};
