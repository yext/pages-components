// Use this function within a click handler for whatever needs to be tracked
// https://developers.google.com/adwords-remarketing-tag/asynchronous/#firing-the-asynchronous-adwords-remarketing-tag-on-page-load
//
// Example call:
// window.google_trackConversion({
//   google_conversion_id: 123456789,
//   google_custom_params: {
//     parameter1: 'abc123',
//     parameter2: 29.99
//   },
//   google_remarketing_only: true
// });

export class GoogleAdwords {
  static init() {
    window.trackConv = (coversionId, conversionLabel, customParams, remarketingOnly) =>
      window.google_trackConversion({
        google_conversion_id: coversionId,
        google_conversion_label: conversionLabel,
        google_custom_params: customParams,
        google_remarketing_only: remarketingOnly
      })
    ;
  }
}
