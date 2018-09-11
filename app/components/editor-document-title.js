import { schedule } from '@ember/runloop';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import  { computed } from '@ember/object';

export default Component.extend({
  active: false,
  editorDocument: null,
  titlePlugin: service('rdfa-editor-document-title-plugin'),
  overruledTitle: '',
  generatedTitle: '',

  allowManualOverrule: computed('generatedTitle', function(){
    if(this.generatedTitle.length > 0){
      return false;
    }
    return true;
  }),

  title: computed('overruledTitle', 'generatedTitle', function(){
    if(this.generatedTitle.length > 0){
      this.set('overruledTitle', '');
      this.set('editorDocument.title', this.generatedTitle);
    }

    if(this.overruledTitle.length > 0){
      this.set('editorDocument.title', this.overruledTitle);
    }

    if(this.overruledTitle.length == 0 && this.generatedTitle.length == 0){
      this.set('editorDocument.title', 'Naamloos document');
    }

    return this.editorDocument.title;

  }),

  titleObserver(){
    this.set('generatedTitle', this.titlePlugin.title);
  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('overruledTitle', this.editorDocument.title || '');

    if(this.titlePlugin)
      this.titlePlugin.addObserver('title', this.titleObserver.bind(this));
  },

  actions:{
    toggleActive(){
      this.set('active', !this.active);

      if (this.active) {
        schedule('afterRender', () => this.$('input').focus());
      }
   }
  }
});
