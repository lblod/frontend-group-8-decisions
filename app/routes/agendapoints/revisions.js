import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class AgendapointsRevisionsRoute extends Route {
  @service store;
  @service router;

  async model() {
    const { documentContainer, editorDocument, returnToMeeting } =
      this.modelFor('agendapoints');
    return RSVP.hash({
      revisions: this.fetchRevisions.perform(editorDocument),
      documentContainer,
      editorDocument,
      returnToMeeting,
    });
  }

  @task
  *fetchRevisions(currentVersion) {
    let revisions = [currentVersion];
    let revision = yield currentVersion.get('previousVersion');
    while (revision) {
      revisions.push(revision);
      revision = yield revision.get('previousVersion');
    }
    return revisions;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.revisionDetail = model.revisions[0];
  }
}
