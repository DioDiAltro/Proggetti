// Quicksort (Lomuto, pivot = ultimo elemento) su 2000 elementi: conta i
// confronti e la profondità massima della ricorsione per vari input.
// Poi la versione con il pivot scelto a caso, sull'input già ordinato.
#include <iostream>
#include <random>
#include <vector>
using namespace std;

long long confronti = 0;
int profondita = 0, profonditaMax = 0;
mt19937 gen(2024);                         // seme fisso: stesso output a ogni esecuzione

int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        confronti++;                       // il confronto a[j] <= pivot
        if (a[j] <= pivot) {
            i++;
            swap(a[i], a[j]);
        }
    }
    swap(a[i + 1], a[hi]);
    return i + 1;
}

//@region random
// Pivot casuale: si sceglie una posizione a caso in [lo, hi], la si
// scambia con a[hi] e si partiziona come prima.
int partitionRandom(vector<int>& a, int lo, int hi) {
    int r = lo + gen() % (hi - lo + 1);
    swap(a[r], a[hi]);
    return partition(a, lo, hi);
}
//@endregion

void quickSort(vector<int>& a, int lo, int hi, bool casuale) {
    profondita++;
    if (profondita > profonditaMax) profonditaMax = profondita;
    if (lo < hi) {
        int p = casuale ? partitionRandom(a, lo, hi) : partition(a, lo, hi);
        quickSort(a, lo, p - 1, casuale);
        quickSort(a, p + 1, hi, casuale);
    }
    profondita--;
}

void prova(const char* nome, vector<int> a, bool casuale) {   // a per valore: una copia
    confronti = 0;
    profonditaMax = 0;
    int n = a.size();
    quickSort(a, 0, n - 1, casuale);
    cout << nome;
    cout.width(10);
    cout << confronti;
    cout.width(12);
    cout << profonditaMax << '\n';
}

int main() {
    const int n = 2000;
    vector<int> casuale(n), ordinato(n), inverso(n), uguali(n, 7);
    for (int i = 0; i < n; i++) {
        casuale[i] = gen() % 100000;
        ordinato[i] = i;
        inverso[i] = n - i;
    }
    cout << "n = 2000                   confronti  profondità\n";
    prova("casuale                   ", casuale, false);
    prova("già ordinato              ", ordinato, false);
    prova("al contrario              ", inverso, false);
    prova("tutti uguali              ", uguali, false);
    prova("già ordinato, pivot a caso", ordinato, true);
    cout << "n(n-1)/2 = " << n * (n - 1) / 2 << '\n';
    return 0;
}
