import { computed } from '@ember/object';
import { alias, notEmpty, or } from '@ember/object/computed';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  currentSession: service(),

  /** Name of the kind of resource to sign/publish (e.g. 'agenda', 'besluitenlijst', ... */
  name: null,
  /** Name of the current selected step */
  step: null,
  /** Versioned document to be signed/published */
  document: null,
  /** Preview of versioned document together with current document id */
  mockDocument: null,
  /** Function to trigger the signing of the document */
  signing: null,
  /** Function to trigger the publication of the document */
  publish: null,
  /** Function to trigger the printing of the document */
  print: null,

  showSigningModal: false,
  showPublishingModal: false,

  signaturesCount: alias('document.signedResources.length'),
  isPublished: notEmpty('document.publishedResource.id'),
  isSignedByCurrentUser: true,

  async init() {
    this._super(...arguments);
    this.set('bestuurseenheid', await this.currentSession.group);
    const currentUser = await this.currentSession.user;
    let firstSignatureUser = null;
    if(this.document) {
      const signedResources = await this.document.signedResources;
      firstSignatureUser = await signedResources.get('firstObject').get('gebruiker');
    }
    this.set('isSignedByCurrentUser', currentUser == firstSignatureUser);

  },

  title: computed('name', function(){
    return `Voorvertoning ${this.name}`;
  }),
  header: null,
  headerWithDefault: or('header', 'name'),
  status: computed('signaturesCount', 'isPublished', function() {
    if( this.isPublished )
      return 'published';
    if( this.signaturesCount == 1 )
      return 'firstSignature';
    if( this.signaturesCount == 2 )
      return 'secondSignature';

    return 'concept';
  }),
  handtekeningStatus: computed('signaturesCount', function() {
    if( this.signaturesCount == 1 )
      return { label: 'Tweede ondertekening vereist', color: 'primary-yellow'};
    if( this.signaturesCount == 2 )
      return { label: 'Ondertekend', color: 'primary-blue'};
    return { label: 'Niet ondertekend' };
  }),

  voorVertoningStatus: computed('status', function() {
    if( this.status == 'published' )
      return { label: 'Publieke versie', color: 'primary-blue'};
    if (this.status == 'firstSignature' || this.status == 'secondSignature')
      return { label: 'Ondertekende versie', color: 'primary-yellow' };
    return { label: 'Meest recente versie' };
  }),

  algemeneStatus: computed('status', function(){
    if( this.status == 'published' )
      return { label:'Gepubliceerd', color: 'primary-blue' };
    if( this.status == 'firstSignature' )
      return { label: 'Eerste ondertekening verkregen', color: 'primary-yellow'};
    if( this.status == 'secondSignature' )
      return { label:'Getekend', color: 'primary-yellow'};
    if( this.status == 'concept' )
      return { label: 'Concept'};
    return 'concept';
  }),

  iconName: computed('status', function(){
    if ( this.status == 'concept' )
      return 'vi-edit';
    if ( this.status == 'firstSignature' || this.status == 'secondSignature' )
      return 'vi-clock';
    if ( this.status == 'published' )
      return 'vi-news';

    return 'vi-edit';
  }),

  signDocument: task(function* (signedId){
    this.set('showSigningModal', false);
    this.set('isSignedByCurrentUser', true);
    yield this.signing(signedId);
  }),

  publishDocument: task(function* (signedId){
    this.set('showPublishingModal', false);
    yield this.publish(signedId);
  })
});
