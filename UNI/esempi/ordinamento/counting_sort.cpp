// Counting sort: ordina interi compresi tra 0 e k contando quante volte
// compare ogni valore. Non confronta mai due elementi: costa Θ(n + k).
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

//@region counting
// Restituisce una copia ordinata di a; i valori di a stanno in [0, k].
vector<int> countingSort(const vector<int>& a, int k) {
    int n = a.size();
    vector<int> c(k + 1, 0);                 // c[v] = quante volte compare v //@c-init
    for (int i = 0; i < n; i++)              //@count-loop
        c[a[i]]++;                           //@count
    for (int v = 1; v <= k; v++)             //@prefix-loop
        c[v] += c[v - 1];                    // ora c[v] = quanti sono <= v //@prefix
    vector<int> b(n);                        //@b-init
    for (int i = n - 1; i >= 0; i--) {       // da destra: così è stabile //@place-loop
        c[a[i]]--;                           //@dec
        b[c[a[i]]] = a[i];                   //@place
    }
    return b;                                //@ret
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {2, 5, 3, 0, 2, 3, 0, 3};
    int k = *max_element(a.begin(), a.end());   // il valore più grande: 5
    cout << "Prima: ";
    stampa(a);
    vector<int> b = countingSort(a, k);
    cout << "Dopo:  ";
    stampa(b);
    return 0;
}
