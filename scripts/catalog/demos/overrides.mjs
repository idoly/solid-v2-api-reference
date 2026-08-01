import { asyncDemos } from "./async.mjs";
import { claimDemos } from "./claims.mjs";
import { domDemos } from "./dom.mjs";
import { delegatedEventDemos } from "./events.mjs";
import { flowDemos } from "./flow.mjs";
import { hydrationDemos } from "./hydration.mjs";
import { ownerDemos } from "./owners.mjs";
import { projectionDemos } from "./projection.mjs";
import { reactiveDemos } from "./reactivity.mjs";
import { responseDemos } from "./responses.mjs";
import { storeDemos } from "./stores.mjs";
import { collectionsOverrides } from "./special/collections.mjs";
import { coreOverrides } from "./special/core.mjs";
import { flowOverrides } from "./special/flow.mjs";
import { reactivityOverrides } from "./special/reactivity.mjs";
import { webOverrides } from "./special/web.mjs";

export const demoOverrides = {
  ...coreOverrides,
  ...collectionsOverrides,
  ...flowOverrides,
  ...webOverrides,
  ...reactivityOverrides,
  ...hydrationDemos,
  ...delegatedEventDemos,
  ...projectionDemos,
  ...reactiveDemos,
  ...storeDemos,
  ...responseDemos,
  ...domDemos,
  ...ownerDemos,
  ...asyncDemos,
  ...flowDemos,
  ...claimDemos,
};
