$(function() {
  var config = {
    qrCode: '#QrCode',
    printButton: '#PrintGiftCard',
    giftCardCode: '#GiftCardDigits'
  };

  var $qrCode = $(config.qrCode);
  // eslint-disable-next-line no-new
  new QRCode($qrCode[0], {
    text: $qrCode.attr('data-identifier'),
    width: 220,
    height: 220,
    imageAltText: theme.strings.qrImageAlt
  });

  $(config.printButton).on('click', function() {
    window.print();
  });

  $(config.giftCardCode).on('focus', this.select);
  theme.ktCountdown();
});
