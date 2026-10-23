/* 3A Kaynak — her bölüm ayrı korunur. Android/WhatsApp içi tarayıcı için:
   yeni sekme, indirme, geçmiş (history) ve sayfa kilidi kullanılmaz. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  function dene(ad, fn) { try { fn(); } catch (h) { if (window.console) console.warn('[' + ad + ']', h); } }
  var SVG_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var SVG_KAPAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  dene('gor', function () {
    var el = $$('.gor');
    if (!el.length) return;
    var hepsi = function () { el.forEach(function (x) { x.classList.add('gorundu'); }); };
    if (!('IntersectionObserver' in window)) return hepsi();
    var io = new IntersectionObserver(function (g) {
      g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('gorundu'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    el.forEach(function (x) { io.observe(x); });
    setTimeout(hepsi, 3500);
  });

  dene('menu', function () {
    var dg = $('[data-menu]'), c = $('#cekmece'), ust = $('.ust');
    if (!dg || !c) return;
    function ayarla(acik) {
      if (acik && ust) c.style.top = Math.max(0, ust.getBoundingClientRect().bottom) + 'px';
      c.classList.toggle('acik', acik);
      dg.setAttribute('aria-expanded', acik ? 'true' : 'false');
      dg.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
      dg.innerHTML = acik ? SVG_KAPAT : SVG_MENU;
    }
    dg.addEventListener('click', function () { ayarla(!c.classList.contains('acik')); });
    $$('a', c).forEach(function (a) { a.addEventListener('click', function () { ayarla(false); }); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') ayarla(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) ayarla(false); });
  });

  dene('capa', function () {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var h = document.getElementById(a.getAttribute('href').slice(1));
        if (!h) return;
        ev.preventDefault();
        window.scrollTo({ top: h.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      });
    });
    /* başka sayfadan #çapa ile gelindiyse sabit başlık payını bırak */
    if (location.hash && location.hash.length > 1) {
      var h = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (h) setTimeout(function () { window.scrollTo(0, h.getBoundingClientRect().top + window.pageYOffset - 80); }, 60);
    }
  });

  /* proje filtresi */
  dene('filtre', function () {
    var g = $('#galeri');
    if (!g) return;
    var cip = $$('.cip[data-kat]');
    cip.forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.getAttribute('data-kat');
        cip.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        $$('.proje', g).forEach(function (p) { p.hidden = !(k === 'hepsi' || p.getAttribute('data-kat') === k); p.classList.add('gorundu'); });
      });
    });
  });

  /* büyüteç: geçmişe dokunmaz, sayfayı kilitlemez; kapalıyken dokunuşları engellemez */
  dene('buyutec', function () {
    var b = $('#buyutec');
    if (!b) return;
    var img = $('#by-img'), yazi = $('#by-yazi'), liste = [], i = 0, acildi = 0, son = null;
    function goster() {
      var p = liste[i];
      img.src = p.getAttribute('data-buyuk');
      img.hidden = false;
      img.alt = p.getAttribute('data-yazi');
      yazi.textContent = p.getAttribute('data-yazi') + '  ·  ' + (i + 1) + ' / ' + liste.length;
    }
    function ac(p) {
      liste = $$('.proje').filter(function (x) { return !x.hidden; });
      i = Math.max(0, liste.indexOf(p));
      son = p; goster();
      b.classList.add('acik'); b.setAttribute('aria-hidden', 'false');
      acildi = Date.now();
      var k = $('.by-kapat', b); if (k) k.focus({ preventScroll: true });
    }
    function kapat() {
      if (Date.now() - acildi < 350) return;
      b.classList.remove('acik'); b.setAttribute('aria-hidden', 'true');
      if (son) son.focus({ preventScroll: true });
    }
    $$('.proje').forEach(function (p) { p.addEventListener('click', function () { ac(p); }); });
    b.addEventListener('click', function (ev) {
      var d = ev.target.closest('[data-by]');
      if (d) {
        var v = d.getAttribute('data-by');
        if (v === 'kapat') return kapat();
        i = (i + Number(v) + liste.length) % liste.length; return goster();
      }
      if (ev.target === b) kapat();
    });
    document.addEventListener('keydown', function (ev) {
      if (!b.classList.contains('acik')) return;
      if (ev.key === 'Escape') { acildi = 0; kapat(); }
      if (ev.key === 'ArrowRight') { i = (i + 1) % liste.length; goster(); }
      if (ev.key === 'ArrowLeft') { i = (i - 1 + liste.length) % liste.length; goster(); }
    });
  });

  /* teklif formu */
  dene('form', function () {
    $$('form.talep').forEach(function (f) {
      var kutu = f.parentNode, basari = $('.basari', kutu), ozet = $('.ozet', kutu);
      function alan(el) { return el.closest('.alan') || el.closest('.onay'); }
      function isaretle(el, hatali) { var a = alan(el); if (a) a.classList.toggle('hata', hatali); if (hatali) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
      function telTemiz(v) {
        var d = v.replace(/\D/g, '');
        if (d.indexOf('90') === 0 && d.length === 12) d = d.slice(2);
        if (d.charAt(0) === '0') d = d.slice(1);
        return d;
      }
      function kontrol() {
        var E = f.elements, ilk = null;
        function k(el, ok) { isaretle(el, !ok); if (!ok && !ilk) ilk = el; }
        var ad = E.ad.value.trim();
        k(E.ad, ad.length >= 3 && /\s/.test(ad));
        var t = telTemiz(E.tel.value); k(E.tel, t.length === 10 && /^[2-5]/.test(t));
        var ep = E.eposta.value.trim(); k(E.eposta, !ep || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep));
        k(E.hizmet, !!E.hizmet.value);
        k(E.not, E.not.value.trim().length >= 5);
        k(E.kvkk, E.kvkk.checked);
        return ilk;
      }
      ['ad', 'tel', 'eposta', 'hizmet', 'not'].forEach(function (n) {
        var el = f.elements[n];
        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () { if (alan(el).classList.contains('hata')) kontrol(); });
      });
      f.elements.kvkk.addEventListener('change', function () { if (alan(f.elements.kvkk).classList.contains('hata')) kontrol(); });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var ilk = kontrol();
        if (ilk) { ilk.focus(); return; }
        var E = f.elements, t = telTemiz(E.tel.value);
        var sec = function (n) { var x = f.querySelector('input[name=' + n + ']:checked'); return x ? x.value : ''; };
        var s = ['Hizmet: ' + E.hizmet.value, 'Malzeme: ' + sec('malzeme'), 'Yer: ' + sec('yer')];
        if (E.adet.value.trim()) s.push('Adet: ' + E.adet.value.trim());
        s.push('İş: ' + E.not.value.trim(), '', 'Ad soyad: ' + E.ad.value.trim());
        if (E.firma.value.trim()) s.push('Firma: ' + E.firma.value.trim());
        s.push('Telefon: 0' + t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6, 8) + ' ' + t.slice(8));
        if (E.eposta.value.trim()) s.push('E-posta: ' + E.eposta.value.trim());
        var metin = s.join('\n');
        ozet.textContent = metin;
        $('.wa-gonder', kutu).href = 'https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent('Merhaba, web sitesinden teklif talebi:\n\n' + metin);
        $('.posta-gonder', kutu).href = 'mailto:' + f.getAttribute('data-posta') + '?subject=' + encodeURIComponent('Teklif talebi: ' + E.hizmet.value) + '&body=' + encodeURIComponent(metin);
        f.hidden = true;
        basari.classList.add('acik');
        window.scrollTo({ top: kutu.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
        try { basari.focus({ preventScroll: true }); } catch (h) { basari.focus(); }
      });
      var yeni = $('.yeni-talep', kutu);
      if (yeni) yeni.addEventListener('click', function () {
        f.reset(); f.hidden = false; basari.classList.remove('acik');
        $$('.hata', f).forEach(function (x) { x.classList.remove('hata'); });
        f.elements.ad.focus();
      });
    });
  });
})();
