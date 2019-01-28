import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import defaultContext from '../config/editor-document-default-context';

export default Model.extend({
  uri: attr(),
  title: attr(),
  content: attr(),
  context: attr('string', { defaultValue: defaultContext}),
  createdOn: attr('datetime'),
  updatedOn: attr('datetime'),
  starred: attr(),
  origin: attr(),
  status: belongsTo('editor-document-status', {inverse: null }),
  previousVersion: belongsTo('editor-document', {inverse: 'nextVersion'}),
  nextVersion: belongsTo('editor-document', {inverse: 'previousVersion'})
});
