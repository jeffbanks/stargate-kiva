export function textLayer() {
  return {
    'id': 'loan_dots',
    'type': 'symbol',
    'source': 'kiva-loans',
    'filter': ['!=', 'cluster', true],
    'layout': {
        'text-field': [
            'number-format',
            ['get', 'funded_amount'],
            { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 10
    },
    'paint': {
        'text-color': 'white'
    }
  }
};

export function circleLayer(low, high, colors) {
  return {
    'id': 'loan_clusters',
    'type': 'circle',
    'source': 'kiva-loans',
    'filter': ['!=', 'cluster', true],
    'paint': {
        'circle-color': [
            'case',
            low,
            colors[0],
            high,
            colors[1],
            colors[1]
        ],
        'circle-opacity': 0.6,
        'circle-radius': 12
    }
  }
};