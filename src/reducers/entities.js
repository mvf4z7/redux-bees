import immutable from "object-path-immutable";

const initialState = {};

export default function reducer(state = initialState, action) {
  if (!action.meta || !action.meta.api) {
    return state;
  }

  const { type: metaType } = action.meta;

  if (metaType === "response" && action.payload && action.payload.body) {
    let newState = state;
    const { data, included } = action.payload.body;

    let items;

    if (Array.isArray(data)) {
      items = data;
    } else if (data) {
      items = [data];
    } else {
      items = [];
    }

    if (Array.isArray(included)) {
      items = items.concat(included);
    }

    /* Initial approach
    newState = items.reduce(function(acc, item) {
      let mergedItem = item;
      if (acc[item.type] && acc[item.type][item.id]) {
        const previousItem = acc[item.type][item.id];

        let mergedAttributes = item.attributes;
        if (previousItem.attributes && item.attributes) {
          mergedAttributes = Object.assign(
            {},
            previousItem.attributes,
            item.attributes
          );
        }

        let mergedRelationships = item.relationships;
        if (previousItem.relationships && item.relationships) {
          mergedRelationships = Object.keys(item.relationships).reduce(
            (relationshipAcc, relationship) => {
              if (previousItem.relationships[relationship]) {
                relationshipAcc[relationship] = Object.assign(
                  {},
                  previousItem.relationships[relationship],
                  item.relationships[relationship]
                );
              }
              return relationshipAcc;
            },
            item.relationships
          );
        }
        mergedItem = Object.assign({}, item, {
          attributes: mergedAttributes,
          relationships: mergedRelationships,
        });
      }
      return _objectPathImmutable2.default.set(
        acc,
        [item.type, item.id],
        mergedItem
      );
    }, newState);
    */

    newState = items.reduce((acc, item) => {
      if (
        acc.hasOwnProperty(item.type) &&
        acc[item.type].hasOwnProperty(item.id)
      ) {
        const previousItem = acc[item.type][item.id];
        const mergedData = {};

        if (previousItem.attributes && item.attributes) {
          mergedData.attributes = Object.assign(
            {},
            previousItem.attributes,
            item.attributes
          );
        }

        if (previousItem.relationships && item.relationships) {
          mergedData.relationships = Object.keys(item.relationships).reduce(
            (relationshipAcc, relationship) => {
              if (previousItem.relationships[relationship]) {
                relationshipAcc[relationship] = Object.assign(
                  {},
                  previousItem.relationships[relationship],
                  item.relationships[relationship]
                );
              } else {
                relationshipAcc[relationship] =
                  item.relationships[relationship];
              }
              return relationshipAcc;
            },
            // This is where the request body object is being modified
            // item.relationships
            {}
          );
        }

        item = Object.assign({}, item, mergedData);
      }

      return immutable.set(acc, [item.type, item.id], item);
    }, newState);

    return newState;
  }

  return state;
}
