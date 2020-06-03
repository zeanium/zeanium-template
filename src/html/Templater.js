/**
 * Created by yangyxu on 2/23/20.
 */

var CHARS = {
    $: '__$',
    BEGIN: '<%',
    END: '%>',
    ENTER: '\n',
    INCLUDE: '####include####'
};

var Templater = require('../Templater');

module.exports = zn.Class(Templater, {
    properties: {
        start: CHARS.BEGIN,
        end: CHARS.END,
        templete: '',
        templeteConvert: null,
        data: null
    },
    methods: {
        init: function (objs){
            this.sets(objs);
            this._data = {};
        },
        render: function (templete, data){
            var _templete = templete || this._templete,
                _data = data || this._data;

            return this.__load(_templete, _data);
        },
        __load: function (templete, data){
            var _templete = this._templeteConvert ? this._templeteConvert(templete) : templete;
            return this.__apply(_templete, data);
        },
        __apply: function (templete, data){
            var _argvs = [],
                _values = [],
                _analyze = this.__analyze(templete),
                _data = data,
                _context = _data;

            console.log(_analyze, templete, data);

            var _temp = _analyze[0],
                _includes = _analyze[1],
                _str = '';

            for(var key in _data){
                _argvs.push(key);
                _values.push(_data[key]);
            }

            try {
                _str = (new Function(_argvs, _temp)).apply(_context, _values).join("");
                console.log(_argvs, _values, _str);

                _str = this.unescape(_str);

                var _count = Object.keys(_includes).length;
                if(_count){
                    return this.__loadIncludes(_str, _includes, _context, _count);
                }else{
                    return _str;
                }

            } catch (err) {
                throw err;
            }
        },
        __analyze: function (templete){
            var _$ = CHARS.$,
                _begin = CHARS.BEGIN,
                _end = CHARS.END,
                _enter = CHARS.ENTER,
                _temp = templete,
                _self = this,
                _includes = {};

            _temp = _temp.replace(/\\/g, "\\\\");

            var _beginAry = _temp.split(_begin),
                _endAry,
                _endLen = 0,
                _endFirst = '',
                _endSecond = '',
                _body = '',
                _view = '',
                _data = '',
                value = null;

            console.log(_beginAry);

            for(var i = 0, _len = _beginAry.length; i < _len; i++){
                value = _beginAry[i];
                if(!value) continue;
                _endAry = value.split(_end);
                _endLen = _endAry.length;
                _endFirst = _endAry[0].trim();
                _endSecond = _endAry[1];
                switch(_endLen){
                    case 1:
                        _body += _$ + ".push('" + _self.escape(_endFirst) + "');";
                        break;
                    case 2:
                        if(_endFirst.indexOf('include(') !== -1){
                            _view = _endFirst.substring(8, _endFirst.length - 1).split(',');
                            _data = _view[1]||_data;
                            _view = _view[0].substring(1, _view[0].length-1);
                            _endFirst = CHARS.INCLUDE +':' + _view;
                            _includes[_view] = {
                                view: _view,
                                data: _data,
                                tag: _endFirst
                            };
                            _body += _$ + ".push('\\n\\t" + _endFirst + "');";
                        }
                        else if (_endFirst[0] === '=') {
                            _body += _$ + ".push(" + _endFirst.slice(1) + ");";
                        }
                        else {
                            if(_endFirst.indexOf('{') != -1||_endFirst.indexOf('}') != -1){
                                _body += _endFirst;
                                //_endSecond = _endSecond.slice(1);
                                //console.log(_endSecond);
                            }
                        }

                        _body += _$ + ".push('" + _self.escape(_endSecond) + "');";
                        break;
                    case 3:

                        break;
                }
            }

            _body = "var " + _$ + " = []; " + _body + " return " + _$+";";

            return [_body, _includes];
        },
        __loadIncludes: function (temp, includes, context, count){
            var _include = null,
                _data = context,
                _curr = 0;

            for(var i = 0, _len = includes.length; i < _len; i++){
                _include = includes[i];
                if (!_include.view) {  
                    continue;
                }
                if(_include.data){
                    _data = context[_include.data] || context;
                }

                _curr++;
                temp = temp.split(_include.tag).join(this.__load(_include.view, _data));
                if(_curr == count){
                    return temp
                }
            }

            return temp;
        }
    }
});