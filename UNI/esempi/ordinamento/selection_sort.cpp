// Selection sort: a ogni passo cerca il minimo della parte non ancora
// ordinata e lo scambia con il primo elemento di quella parte.
#include <iostream>
#include <vector>
using namespace std;

//@region sort
void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {          //@outer
        int minimo = i;                         //@min-init
        for (int j = i + 1; j < n; j++) {       //@inner
            if (a[j] < a[minimo]) {             //@cmp
                minimo = j;                     //@new-min
            }
        }
        swap(a[i], a[minimo]);                  //@swap
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
    selectionSort(a);
    cout << "Dopo:  ";
    stampa(a);
    return 0;
}
