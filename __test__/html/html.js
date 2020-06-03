var template = require('../../index');

var templater = new template.html.Templater({
    templete: '<%name %>  : <%age %>',
    data: {
        name: 'yangyxu',
        age: 20
    }
});

console.log(templater.render());
