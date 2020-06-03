/**
 * Created by yangyxu on 2/23/20.
 */

module.exports = zn.Class({
    properties: {},
    methods: {
        init: function (objs){
            this.sets(objs);
        },
        escape: function (value){
            return value;
            //return escape(value);
        },
        unescape: function (value){
            return value;
            //return unescape(value);
        },
        analyzeTemplate: function (template){
            throw new Error('analyzeTemplate error');
        },
        getContext: function (){
            throw new Error('getContext error');
        },
        render: function (templete, data){
            throw new Error('render error');
        }
    }
});