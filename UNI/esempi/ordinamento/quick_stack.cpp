// Quanto stack usa il quicksort? Si misura la profondità massima della
// ricorsione (quante chiamate sono aperte insieme) su 5000 elementi.
// La seconda versione chiama la ricorsione solo sulla parte più piccola:
// ogni chiamata riceve al massimo metà dell'intervallo, quindi la
// profondità resta O(log n) anche nel caso peggiore.
#include <algorithm>
#include <iostream>
#include <random>
#include <vector>
using namespace std;

int profonditaMax = 0;

int partition(vector<int>& a, int lo, int hi) {   // Lomuto, pivot = a[hi]
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++)
        if (a[j] <= pivot) swap(a[++i], a[j]);
    swap(a[i + 1], a[hi]);
    return i + 1;
}

// la versione del capitolo: ricorsione su tutte e due le parti
void quickSort(vector<int>& a, int lo, int hi, int livello) {
    profonditaMax = max(profonditaMax, livello);
    if (lo < hi) {
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1, livello + 1);
        quickSort(a, p + 1, hi, livello + 1);
    }
}

//@region piccola
void quickSortPiccola(vector<int>& a, int lo, int hi, int livello) {
    profonditaMax = max(profonditaMax, livello);   // solo per misurare
    while (lo < hi) {
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) {            // la parte sinistra è la più piccola
            quickSortPiccola(a, lo, p - 1, livello + 1);
            lo = p + 1;                   // la destra la fa il ciclo
        } else {                          // la parte destra è la più piccola
            quickSortPiccola(a, p + 1, hi, livello + 1);
            hi = p - 1;                   // la sinistra la fa il ciclo
        }
    }
}
//@endregion

int prova(vector<int> a, bool piccola) {    // a per valore: una copia
    profonditaMax = 0;
    int n = a.size();
    if (piccola) quickSortPiccola(a, 0, n - 1, 1);
    else quickSort(a, 0, n - 1, 1);
    return profonditaMax;
}

int main() {
    const int n = 5000;
    vector<int> ordinato(n), casuale(n);
    mt19937 gen(7);
    for (int i = 0; i < n; i++) {
        ordinato[i] = i;
        casuale[i] = gen() % 100000;
    }
    cout << "n = 5000                        profondità massima\n";
    cout << "già ordinato, due ricorsioni    " << prova(ordinato, false) << '\n';
    cout << "già ordinato, parte piccola     " << prova(ordinato, true) << '\n';
    cout << "casuale, due ricorsioni         " << prova(casuale, false) << '\n';
    cout << "casuale, parte piccola          " << prova(casuale, true) << '\n';
    return 0;
}
