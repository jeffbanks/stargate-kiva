import React from 'react';

function shortenNumber(value) {
   if (value >= 10**9)
      return (value / 10**9).toFixed(0) + 'B';
   if (value >= 10**6)
      return (value / 10**6).toFixed(0) + 'M';
   if (value >= 10**3)
      return (value / 10**3).toFixed(0) + 'K';
   return value;
}

export function renderRing(props, numOfClusters, totalFunding, colors) {
    var offsets = [];
    var funded_amount = props.funded_amount;
    var fundingAvg = totalFunding / numOfClusters;
    var counts = [
        props.low,
        props.high
    ];
    var total = 0;
    for (var i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
    }
    var fontSize = funded_amount >= fundingAvg * 1.5  ? 22 :
            funded_amount >= fundingAvg        ? 20 :
            funded_amount >= fundingAvg * .5   ? 18 : 16;
    var r = funded_amount >= fundingAvg * 1.5  ? 50 :
            funded_amount >= fundingAvg        ? 32 :
            funded_amount >= fundingAvg * .5   ? 24 : 18;
    var r0 = Math.round(r * 0.6);
    var w = r * 2;

    var html =
        '<div><svg width="' +
        w +
        '" height="' +
        w +
        '" viewbox="0 0 ' +
        w +
        ' ' +
        w +
        '" text-anchor="middle" style="font: ' +
        fontSize +
        'px sans-serif; display: block">';

    for (i = 0; i < counts.length; i++) {
        html += segment(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            r0,
            colors[i]
        );
    }
    html +=
        '<circle cx="'+r+'" cy="'+r+'" r="'+r0+'" fill="white" /><text dominant-baseline="central" transform="translate(' +
        r +
        ', ' +
        r +
        ')">' +
        shortenNumber(props.funded_amount) +
        '</text></svg></div>';

    var el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild;
}

function segment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        var a0 = 2 * Math.PI * (start - 0.25);
        var a1 = 2 * Math.PI * (end - 0.25);
        var x0 = Math.cos(a0),
            y0 = Math.sin(a0);
        var x1 = Math.cos(a1),
            y1 = Math.sin(a1);
        var largeArc = end - start > 0.5 ? 1 : 0;

        return [
            '<path d="M',
            r + r0 * x0,
            r + r0 * y0,
            'L',
            r + r * x0,
            r + r * y0,
            'A',
            r,
            r,
            0,
            largeArc,
            1,
            r + r * x1,
            r + r * y1,
            'L',
            r + r0 * x1,
            r + r0 * y1,
            'A',
            r0,
            r0,
            0,
            largeArc,
            0,
            r + r0 * x0,
            r + r0 * y0,
            '" fill="' + color + '" />'
        ].join(' ');
    }

export function buildGeoFeature(doc) {
   return {
      "type": "Feature", 
      "properties": doc,
      "geometry": { 
        "type": "Point", 
        "coordinates": [ doc.lon,
                          doc.lat ] 
      }
   }
}

export function buildDialog(props) {
   return (
      <div style={{width: 200}}>
         <b>{props.country_name}</b>
         <p>Town: {props.town}</p>
         <p>Loan: $ {props.loan_amount.toFixed(2)}</p>
         <p>Funded: $ {props.funded_amount.toFixed(2)}</p>
      </div>
   );
}
