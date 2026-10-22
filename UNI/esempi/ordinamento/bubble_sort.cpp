// Bubble sort: confronta le coppie vicine e le scambia se sono in ordine
// sbagliato. A ogni passata il più grande "risale" fino in fondo.
// Se in una passata non avviene nessuno scambio, l'array è già ordinato.
#include <iostream>
#include <vector>
using namespace std;

//@region sort
void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {           //@outer
        bool scambiato = false;                 //@flag
        for (int j = 0; j < n - 1 - i; j++) {   //@inner
            if (a[j] > a[j + 1]) {              //@cmp
                swap(a[j], a[j + 1]);           //@swap
                scambiato = true;
            }
        }
        if (!scambiato) break;                  //@stop
    }
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {5, 2, 4, 6, 1, 3};
    cout << "Prima: ";
    stampa(a);
    bubbleSort(a);
    cout << "Dopo:  ";
    stampa(a);
    return 0;
}
