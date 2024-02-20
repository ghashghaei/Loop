import * as VueFactory from 'Models/utils/vue-factory';
import * as ComponentParser from 'Models/utils/component-parser';

// Define static components & write them to map
import icon from 'Components/vue/icon';
import crew from 'Components/vue/crew';

export const staticComponents = {
	icon,
	crew,
};

ComponentParser.registerFactory('vue', VueFactory.create);
