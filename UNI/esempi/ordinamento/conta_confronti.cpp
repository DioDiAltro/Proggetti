// Conta i confronti fatti dai tre ordinamenti semplici su array di
// 1000 elementi: già ordinato, al contrario, casuale.
// I numeri confermano l'analisi: n(n-1)/2 = 499500 nel caso peggiore,
// n-1 = 999 per insertion e bubble sort sull'array già ordinato.
#include <iostream>
#include <random>
#include <vector>
using namespace std;

long long confronti = 0;

bool minore(int x, int y) {   // ogni confronto passa da qui e viene contato
    confronti++;
    return x < y;
}

void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int minimo = i;
        for (int j = i + 1; j < n; j++)
            if (minore(a[j], a[minimo])) minimo = j;
        swap(a[i], a[minimo]);
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

int main() {
    const int n = 1000;
    vector<int> ordinato(n), inverso(n), casuale(n);
    mt19937 gen(42);                  // seme fisso: stessi numeri a ogni esecuzione
    for (int i = 0; i < n; i++) {
        ordinato[i] = i;
        inverso[i] = n - i;
        casuale[i] = gen() % 100000;
    }

    const char* nomi[] = {"selection", "insertion", "bubble   "};
    void (*algoritmi[])(vector<int>&) = {selectionSort, insertionSort, bubbleSort};

    cout << "n = " << n << "    ordinato   inverso   casuale\n";
    for (int k = 0; k < 3; k++) {
        cout << nomi[k] << "  ";
        for (const vector<int>* dati : {&ordinato, &inverso, &casuale}) {
            vector<int> a = *dati;    // copia: ogni algoritmo parte dagli stessi dati
            confronti = 0;
            algoritmi[k](a);
            cout.width(10);
            cout << confronti;
        }
        cout << '\n';
    }
    return 0;
}
