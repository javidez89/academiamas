'use strict';

window.ACADEMY_CATALOG = Object.freeze([
  Object.freeze({
    key: 'ctfl',
    src: 'courses/ctfl/course-data.js',
    access: 'free',
    family: 'ISTQB',
    areas: Object.freeze(['testing-istqb']),
    tags: Object.freeze(['Testing', 'ISTQB', 'Fundamentos'])
  }),
  Object.freeze({
    key: 'ctai',
    src: 'courses/ctai/course-data.js',
    access: 'free',
    family: 'ISTQB',
    areas: Object.freeze(['testing-istqb', 'ai-automation']),
    tags: Object.freeze(['Testing', 'ISTQB', 'Inteligencia artificial'])
  }),
  Object.freeze({
    key: 'scrum-master',
    src: 'courses/scrum-master/course-data.js',
    access: 'free',
    family: 'Scrum',
    areas: Object.freeze(['scrum-agility']),
    tags: Object.freeze(['Scrum', 'Scrum Master', 'Agilidad', 'Scrum Guide 2020'])
  })
]);
