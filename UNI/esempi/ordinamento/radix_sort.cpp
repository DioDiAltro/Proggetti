// Radix sort LSD (dalla cifra meno significativa): ordina per la cifra
// delle unità, poi per quella delle decine, poi delle centinaia...
// Ogni passata è un counting sort STABILE sulla cifra: senza stabilità
// l'ordinamento delle passate precedenti andrebbe perso.
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

//@region radix
// Ordina a in modo stabile secondo la cifra di peso
// esp (1 = unità, 10 = decine, 100 = centinaia).
void countingSortCifra(vector<int>& a, int esp) {
    int n = a.size();
    vector<int> c(10, 0);
    for (int i = 0; i < n; i++)
        c[(a[i] / esp) % 10]++;        //@count
    for (int d = 1; d < 10; d++)
        c[d] += c[d - 1];              //@prefix
    vector<int> b(n);
    for (int i = n - 1; i >= 0; i--) {
        int d = (a[i] / esp) % 10;     // la cifra
        c[d]--;
        b[c[d]] = a[i];                //@place
    }
    a = b;                             //@copy
}

void radixSort(vector<int>& a) {
    int massimo = *max_element(a.begin(), a.end());
    // una passata per ogni cifra del massimo
    for (int esp = 1; massimo / esp > 0; esp *= 10) //@pass
        countingSortCifra(a, esp);     //@call
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {329, 457, 657, 839, 436, 720, 355};
    cout << "Prima:              ";
    stampa(a);
    int massimo = *max_element(a.begin(), a.end());
    for (int esp = 1; massimo / esp > 0; esp *= 10) {
        countingSortCifra(a, esp);           // le stesse passate di radixSort, stampate una per una
        cout << "Dopo la cifra " << esp << ":";
        cout << (esp == 1 ? "    " : esp == 10 ? "   " : "  ");
        stampa(a);
    }
    vector<int> b = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(b);
    cout << "Un altro esempio: ";
    stampa(b);
    return 0;
}
