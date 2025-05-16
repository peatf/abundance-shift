import AbundanceGPS from './components/AbundanceGPS';
import { useAbundanceStore, stages } from './store/abundanceStore';

// To allow host app to control Tailwind's dark mode if needed,
// or to reset the module externally.
export { useAbundanceStore, stages }; 

export default AbundanceGPS; 