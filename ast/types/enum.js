var _ = require('lodash');
var util = require('../../util');

var EnumType = {
  create: function(node, contract) {
    this.type = contract + '.' + node.attributes.name;
    this.values = _.map(node.children, function(node) {
      return node.attributes.name;
    });
    return this;
  },
  is: function(node, contract) {
    if (node.name != 'UserDefinedTypeName') return false;
    var name = node.attributes.name;
    if (name.indexOf('.') == -1) name = contract + '.' + name;
    return name == this.type;
  },
  init: function(node, typeCreator, contract) {
    return this;
  },
  retrieve: function(storage, hashDict, position) {
    if (position.offset == 32) {
      util.inc(position.index);
      position.offset = 0;
    }

    var entry = _.find(storage, function(entry) {
      return entry.key.equals(position.index);
    });

    var value;
    if (entry) {
      var data = util.decodeRlp(entry.value);
      if (data.length > position.offset) {
        value = data.slice(data.length - position.offset - 1, data.length - position.offset);
      }
    }

    if (position.offset == 31) {
      util.inc(position.index);
      position.offset = 0;
    } else {
      position.offset++;
    }

    return this.parseValue(value);
  },
  parseValue: function(buf) {
    return this.values[buf ? buf[0] : 0];
  }
};

module.exports = EnumType;