# Instrukcja panelu administracyjnego UTSlovakia

Panel służy do zarządzania katalogiem produktów i danymi firmy widocznymi na stronie. Zmiany są widoczne na stronie **od razu po zapisaniu**. Nie trzeba nic publikować ani nikogo prosić o wdrożenie.

## 1. Logowanie

- Adres: **https://www.utslovakia.sk/admin**
- Po 5 błędnych próbach logowania konto jest blokowane na 10 minut.
- Hasło zmienisz w swoim profilu (ikona w prawym górnym rogu).
- Zapomniane hasło: poproś administratora, żeby ustawił nowe w **System → Użytkownicy**. Strona nie wysyła e-maili, więc link „Nie pamiętasz hasła?” nie zadziała.

### Role

| Rola              | Co może                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Administrator** | Wszystko, także zakładanie i usuwanie kont użytkowników (menu **System → Użytkownicy**). |
| **Redaktor**      | Produkty, kategorie, marki, zdjęcia i dane firmy. Może zmienić tylko własne konto.       |

## 2. Menu

- **Katalog:** Produkty, Kategorie, Marki
- **Treści:** Media (zdjęcia), Dane firmy i kontakt
- **System:** Użytkownicy

## 3. Języki

Strona działa w czterech językach: polskim (główny), angielskim, słowackim i portugalskim (Brazylia).

- Przełącznik **„Ustawienia regionalne”** u góry ekranu zmienia język edytowanej treści.
- Najpierw zawsze uzupełnij wersję **polską**. Jeśli pole w innym języku jest puste, strona pokaże tekst polski.
- Tłumaczy się: nazwy i opisy produktów, kluczowe cechy, opisy zdjęć, nazwy, opisy i adresy (slugi) kategorii, pola SEO, godziny otwarcia i FAQ.
- Ceny, SKU, zdjęcia, marka i status są wspólne dla wszystkich języków.

## 4. Produkty

**Katalog → Produkty → „Stwórz nowy”**

### Pasek boczny (prawa strona)

- **Slug (adres URL):** uzupełnia się sam z nazwy, np. „Akceptor ICT A7” → `akceptor-ict-a7`. Po publikacji najlepiej go nie zmieniać, bo stare linki (np. z Google) przestaną działać.
- **SKU:** numer katalogowy, można go wyszukiwać na stronie.
- **Status:**
  - _Opublikowany_: produkt widoczny na stronie
  - _Szkic_: niewidoczny, można spokojnie przygotowywać
  - _Wycofany_: niewidoczny, zostaje w panelu do wglądu (zamiast usuwania)
- **Etykieta:** „Nowość” lub „Bestseller”. Bestsellery trafiają na stronę główną.
- **Dostępność:** Dostępny, Niedostępny, Na zamówienie.
- **Marka:** wybierz z listy albo dodaj nową w **Katalog → Marki**.
- **Link zewnętrzny do zakupu (eBay):** pełny adres aukcji zaczynający się od `https://`. Bez linku na stronie pojawia się przycisk **„Zapytaj o ofertę”**, prowadzący do strony Kontakt.

### Zakładka „Treść”

- **Nazwa** i **Opis**. Opis formatuje się automatycznie:
  - pusta linia rozdziela akapity
  - krótka linia zakończona dwukropkiem (np. `Dane techniczne:`) staje się nagłówkiem
  - kilka linii pod rząd staje się listą; w linii `Napięcie: 12 V` część przed dwukropkiem jest pogrubiona
- **Kategorie:** produkt może być w kilku kategoriach. Pierwsza decyduje o „podobnych produktach” pod opisem.
- **Zdjęcia:** pierwsze zdjęcie jest główne (lista, Google, podgląd linku). Kolejność zmienisz, przeciągając wiersze.
- **Kluczowe cechy:** krótkie punkty wyświetlane przy produkcie.
- **Gwarancja w miesiącach:** obecnie zapisywana tylko w panelu. Na stronie przy każdym produkcie widnieje ogólna informacja o gwarancji.
- **Cena bazowa:** patrz niżej.

### Ceny i waluty

- **PLN jest wymagane.** EUR, USD i BRL są opcjonalne.
- Waluta zależy od języka strony:

  | Wersja strony | Waluta |
  | ------------- | ------ |
  | polska        | PLN    |
  | słowacka      | EUR    |
  | angielska     | USD    |
  | portugalska   | BRL    |

- Jeśli produkt nie ma ceny w danej walucie, ta wersja strony pokaże cenę w PLN.
- Cena **0** (albo brak ceny) wyświetla się jako „Cena na zapytanie”.

### Zakładka „Warianty”

Jeśli produkt występuje w kilku modelach (np. kolor, wersja):

- **Nazwa modelu** (np. „wersja EUR”, „czarny”)
- **SKU** wariantu (opcjonalne)
- **Dostępność modelu:** domyślnie „Dziedzicz z głównego statusu”
- **Nadpisane ceny:** uzupełnij tylko waluty, w których wariant kosztuje inaczej niż produkt główny

### Zakładka „SEO”

Tytuł i opis widoczne w wynikach Google oraz obraz przy udostępnianiu linku. Wszystkie pola są opcjonalne. Puste pola wypełniają się nazwą, początkiem opisu i pierwszym zdjęciem. Przycisk „Wygeneruj automatycznie” uzupełni je za Ciebie.

## 5. Kategorie

**Katalog → Kategorie**

- **Nazwa**, **Slug** (osobny dla każdego języka, tworzy się sam), **Opis** i **Zdjęcie** (wymagane).
- **Kolejność wyświetlania:** mniejsza liczba = wyżej. Kategoria z najmniejszą liczbą jest dużym kafelkiem na stronie głównej, a kolejne cztery tworzą resztę sekcji.
- **Status „Ukryta”** chowa kategorię ze strony. To bezpieczniejsze niż usuwanie, które zrywa powiązania z produktami.

## 6. Zdjęcia (Media)

- Maksymalnie **4 MB** na plik. Większe zdjęcie zmniejsz przed wgraniem (np. zapisz jako JPG w mniejszej rozdzielczości).
- Zdjęcia są automatycznie konwertowane do formatu WebP i zmniejszane, więc nie trzeba ich przygotowywać.
- **Opis zdjęcia (alt)** jest wymagany. Opisz krótko, co widać, np. „Akceptor banknotów ICT A7 – widok z przodu”. Czyta go Google i czytniki ekranu.
- W produkcie można podać inny opis zdjęcia dla danego języka („Opis zdjęcia w tym produkcie”). Puste pole oznacza opis z biblioteki mediów.

## 7. Dane firmy i kontakt

**Treści → Dane firmy i kontakt**

- **Firma:** pełna nazwa, IČO, IČ DPH, wpis do rejestru, adres.
- **Kontakt:** telefony i e-maile (**pierwszy** z listy jest pokazywany w stopce i w menu mobilnym), godziny otwarcia, media społecznościowe (puste pola są ukrywane).
- **Strona główna:** liczby w sekcji powitalnej („Lat w branży”, „Sprzedanych urządzeń”). Puste pole ukrywa liczbę.
- **FAQ:** pytania i odpowiedzi na stronie Kontakt, osobno dla każdego języka. Gdy lista jest pusta, sekcja FAQ jest ukryta.

## 8. Najczęstsze pytania

- **Produktu nie ma na stronie.** Sprawdź, czy ma status „Opublikowany” i przypisaną kategorię, i czy kategoria nie jest „Ukryta”.
- **Na wersji angielskiej widać polski tekst.** Brakuje tłumaczenia: przełącz język na English i uzupełnij pola.
- **Nie mogę wgrać zdjęcia.** Plik jest większy niż 4 MB albo nie jest obrazem.
- **Konto zablokowane.** Odczekaj 10 minut albo poproś administratora o przycisk „Odblokuj” na Twoim koncie w **System → Użytkownicy**.
