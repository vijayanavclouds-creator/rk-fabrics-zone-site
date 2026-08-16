const { compileHomeTemplate } = require('./src/lib/template');
const html = `<div>{{#each items}}<p>{{this.name}}</p>{{/each}}</div>`;
const data = { items: [{name: 'Test1'}, {name: 'Test2'}] };
console.log(compileHomeTemplate(html, data));
