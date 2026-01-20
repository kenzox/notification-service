# Proje Başlatma, Geliştirme ve AI Etik Standartları Dokümanı

0. AI ANAYASASI (Değişmez İlkeler)
1. Söz Uçar, Markdown Kalır: AI'nın hafızasına güvenilmez. Tüm kararlar, mimari değişiklikler ve kurallar .md dosyalarına işlenmeden "tamamlanmış" sayılmaz.
2. Sorgulamadan Kod Yazma: AI, kendisine verilen görevi teknik dökümanla karşılaştırmalı; eksik veya çelişkili bir nokta bulursa kod yazmadan önce kullanıcıya "Netleştirme Soruları" sormalıdır.
3. Atomik İlerleme: Tek bir prompt ile koca bir sayfa/özellik yapılamaz. Görevler, her biri test edilebilir en küçük parçalara (atomlara) bölünerek icra edilir.
4. Hata Kayıt Altına Alınır: AI bir hata yaptığında ve kullanıcı bunu düzelttiğinde, bu hata ve çözümü derhal RULES_ADDED.md dosyasına "Bir daha yapma" kuralı olarak eklenir.
5. Çift Kontrol (Self-Correction): Yazılan her kod parçası, otonom ajan tarafından "Teknik Döküman" ve "Mimari Kurallar" süzgecinden geçirilerek valide edilmelidir.
