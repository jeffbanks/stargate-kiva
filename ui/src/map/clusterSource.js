export function clusterSource(featureCollection, low, high) {
  return {
    'type': 'geojson',
    'data': featureCollection,
    'cluster': true,
    'clusterRadius': 80,
    'clusterProperties': {
        // keep separate counts for each magnitude category in a cluster
        'low': ['+', ['case', low, 1, 0]],
        'high': ['+', ['case', high, 1, 0]],
        'funded_amount': ['+', ['get', 'funded_amount']]
    }
  }
}