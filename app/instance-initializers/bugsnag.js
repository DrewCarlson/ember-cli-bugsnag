import Ember  from 'ember';
import config from '../config/environment';
import { getContext } from 'ember-cli-bugsnag/utils/errors';
import { getMetaData } from '../utils/bugsnag';
import Bugsnag from 'bugsnag';

export default {
  name: 'bugsnag-error-service',

  initialize: function(instance) {

    var bugsnagConfig = config.bugsnag || {}
    var currentEnv = bugsnagConfig.environment || config.environment;

    if (Bugsnag.apiKey === undefined) {
      return;
    }

    if (currentEnv !== 'test' && Bugsnag.notifyReleaseStages.indexOf(currentEnv) !== -1) {
      let owner = instance.lookup ? instance : instance.container;
      let router = owner.lookup('router:main');

      Ember.onerror = function(error) {
        Bugsnag.context = getContext(router);
        const metaData = getMetaData(error, owner);
        Bugsnag.notifyException(error, null, metaData);
        console.error(error.stack);
      };

      const originalDidTransition = router.didTransition || Ember.K;
      router.didTransition = function() {
        Bugsnag.refresh();
        return originalDidTransition.apply(this, arguments);
      };
    }
  }
};
