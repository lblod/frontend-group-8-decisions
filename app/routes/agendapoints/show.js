import Route from '@ember/routing/route';

export default class AgendapointsShowRoute extends Route {
  async model() {
    const { documentContainer } = this.modelFor('agendapoints');
    return {
      documentContainer,
      editorDocument: await documentContainer.get('currentVersion'),
    };
  }
}
