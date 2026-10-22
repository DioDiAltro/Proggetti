// Sei ordinamenti per confronti sugli stessi dati (n = 2000): conta i
// confronti tra elementi facendoli passare tutti dalla funzione minore.
// Quattro tipi di input: casuale, già ordinato, al contrario, pochi valori
// distinti (solo 0..9, quindi moltissimi elementi uguali).
#include <iostream>
#include <random>
#include <vector>
using namespace std;

long long confronti = 0;

bool minore(int x, int y) {          // ogni confronto passa da qui e viene contato
    confronti++;
    return x < y;
}

void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++)
            if (minore(a[j], a[m])) m = j;
        swap(a[i], a[m]);
    }
}

void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && minore(key, a[j])) {   // a[j] > key
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        bool scambiato = false;
        for (int j = 0; j < n - 1 - i; j++)
            if (minore(a[j + 1], a[j])) {        // a[j] > a[j+1]
                swap(a[j], a[j + 1]);
                scambiato = true;
            }
        if (!scambiato) break;
    }
}

void merge(vector<int>& a, int lo, int mid, int hi) {
    vector<int> b(hi - lo + 1);
    int i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) {
        if (!minore(a[j], a[i])) b[k++] = a[i++];   // a[i] <= a[j]
        else b[k++] = a[j++];
    }
    while (i <= mid) b[k++] = a[i++];
    while (j <= hi) b[k++] = a[j++];
    for (k = 0; k < hi - lo + 1; k++) a[lo + k] = b[k];
}

void mergeSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}

int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++)
        if (!minore(pivot, a[j])) swap(a[++i], a[j]);   // a[j] <= pivot
    swap(a[i + 1], a[hi]);
    return i + 1;
}

void quickSort(vector<int>& a, int lo, int hi) {
    if (lo < hi) {
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }
}

void siftDown(vector<int>& a, int i, int n) {   // n = dimensione dello heap
    while (2 * i + 1 < n) {
        int f = 2 * i + 1;                         // figlio sinistro
        if (f + 1 < n && minore(a[f], a[f + 1])) f++;   // il figlio più grande
        if (!minore(a[i], a[f])) break;            // a[i] >= a[f]: heap a posto
        swap(a[i], a[f]);
        i = f;
    }
}

void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);   // build-heap
    for (int fine = n - 1; fine > 0; fine--) {
        swap(a[0], a[fine]);                       // il massimo va in fondo
        siftDown(a, 0, fine);
    }
}

// adattatori: tutte le funzioni con la stessa firma
void mergeTutto(vector<int>& a) { mergeSort(a, 0, (int)a.size() - 1); }
void quickTutto(vector<int>& a) { quickSort(a, 0, (int)a.size() - 1); }

int main() {
    const int n = 2000;
    vector<int> casuale(n), ordinato(n), inverso(n), pochi(n);
    mt19937 gen(42);                  // seme fisso: stessi numeri a ogni esecuzione
    for (int i = 0; i < n; i++) {
        casuale[i] = gen() % 100000;
        ordinato[i] = i;
        inverso[i] = n - i;
        pochi[i] = gen() % 10;
    }
    const char* nomi[] = {"selection", "insertion", "bubble   ", "merge    ", "quick    ", "heap     "};
    void (*algoritmi[])(vector<int>&) = {selectionSort, insertionSort, bubbleSort, mergeTutto, quickTutto, heapSort};

    const vector<int>* dati[] = {&casuale, &ordinato, &inverso, &pochi};

    cout << "n = 2000    casuale  ordinato   inverso  pochi distinti\n";
    for (int k = 0; k < 6; k++) {
        cout << nomi[k];
        for (int t = 0; t < 4; t++) {
            vector<int> a = *dati[t];     // copia: ogni algoritmo parte dagli stessi dati
            confronti = 0;
            algoritmi[k](a);
            cout.width(t < 3 ? 10 : 16);
            cout << confronti;
        }
        cout << '\n';
    }
    return 0;
}
